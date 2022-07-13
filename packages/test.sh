#!/bin/bash

set -ex

# Don't display the pip progress bar when running under CI
[ "$CI" = 'true' ] && export PIP_PROGRESS_BAR=off

# Change to packages directory.
cd "$(dirname "$0")"

# Use a throw-away virtualenv
TEST_PYTHON=${TEST_PYTHON:-"python"}
TEST_ENV_DIR=${TEST_ENV_DIR:-$(mktemp -d -t gxpkgtestenvXXXXXX)}

virtualenv -p "$TEST_PYTHON" "$TEST_ENV_DIR"
. "${TEST_ENV_DIR}/bin/activate"
pip install --upgrade pip setuptools wheel
pip install -r../lib/galaxy/dependencies/pinned-lint-requirements.txt

# ensure ordered by dependency DAG
# TODO: add selenium in once type issues are cleared up
PACKAGE_DIRS=(
    util
    objectstore
    job_metrics
    config
    files
    tool_util
    data
    job_execution
    auth
    web_stack
    web_framework
    navigation
    tours
    app
    webapps
    test_base
    test_driver
    test_api
)
for ((i=0; i<${#PACKAGE_DIRS[@]}; i++)); do
    printf "\n========= TESTING PACKAGE ${PACKAGE_DIRS[$i]} =========\n\n"
    package_dir=${PACKAGE_DIRS[$i]}

    cd "$package_dir"

    # Install extras (if needed)
    if [ "$package_dir" = "util" ]; then
        pip install -e '.[template,jstree]'
    elif [ "$package_dir" = "tool_util" ]; then
        pip install -e '.[cwl,mulled,edam]'
    else
        pip install -e '.'
    fi

    pip install -r test-requirements.txt

    # Prevent execution of alembic/env.py at test collection stage (alembic.context not set)
    # Also ignore functional tests (galaxy_test/ and tool_shed/test/).
    unit_extra='--doctest-modules --ignore=galaxy/model/migrations/alembic/ --ignore=galaxy_test/ --ignore=tool_shed/test/'
    # Ignore exit code 5 (no tests ran)
    pytest $unit_extra . || test $? -eq 5
    make mypy
    cd ..
done
