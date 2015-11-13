define(["libs/underscore","viz/trackster/util","mvc/dataset/data","mvc/tool/tools-form","templates/tool_form.handlebars","templates/tool_link.handlebars","templates/panel_section.handlebars","templates/tool_search.handlebars"],function(a,b,c,d,e,f,g,h){var i={hidden:!1,show:function(){this.set("hidden",!1)},hide:function(){this.set("hidden",!0)},toggle:function(){this.set("hidden",!this.get("hidden"))},is_visible:function(){return!this.attributes.hidden}},j=Backbone.Model.extend({defaults:{name:null,label:null,type:null,value:null,html:null,num_samples:5},initialize:function(){this.attributes.html=unescape(this.attributes.html)},copy:function(){return new j(this.toJSON())},set_value:function(a){this.set("value",a||"")}}),k=Backbone.Collection.extend({model:j}),l=j.extend({}),m=j.extend({set_value:function(a){this.set("value",parseInt(a,10))},get_samples:function(){return d3.scale.linear().domain([this.get("min"),this.get("max")]).ticks(this.get("num_samples"))}}),n=m.extend({set_value:function(a){this.set("value",parseFloat(a))}}),o=j.extend({get_samples:function(){return a.map(this.get("options"),function(a){return a[0]})}});j.subModelTypes={integer:m,"float":n,data:l,select:o};var p=Backbone.Model.extend({defaults:{id:null,name:null,description:null,target:null,inputs:[],outputs:[]},urlRoot:Galaxy.root+"api/tools",initialize:function(b){this.set("inputs",new k(a.map(b.inputs,function(a){var b=j.subModelTypes[a.type]||j;return new b(a)})))},toJSON:function(){var a=Backbone.Model.prototype.toJSON.call(this);return a.inputs=this.get("inputs").map(function(a){return a.toJSON()}),a},remove_inputs:function(a){var b=this,c=b.get("inputs").filter(function(b){return-1!==a.indexOf(b.get("type"))});b.get("inputs").remove(c)},copy:function(a){var b=new p(this.toJSON());if(a){var c=new Backbone.Collection;b.get("inputs").each(function(a){a.get_samples()&&c.push(a)}),b.set("inputs",c)}return b},apply_search_results:function(b){return-1!==a.indexOf(b,this.attributes.id)?this.show():this.hide(),this.is_visible()},set_input_value:function(a,b){this.get("inputs").find(function(b){return b.get("name")===a}).set("value",b)},set_input_values:function(b){var c=this;a.each(a.keys(b),function(a){c.set_input_value(a,b[a])})},run:function(){return this._run()},rerun:function(a,b){return this._run({action:"rerun",target_dataset_id:a.id,regions:b})},get_inputs_dict:function(){var a={};return this.get("inputs").each(function(b){a[b.get("name")]=b.get("value")}),a},_run:function(d){var e=a.extend({tool_id:this.id,inputs:this.get_inputs_dict()},d),f=$.Deferred(),g=new b.ServerStateDeferred({ajax_settings:{url:this.urlRoot,data:JSON.stringify(e),dataType:"json",contentType:"application/json",type:"POST"},interval:2e3,success_fn:function(a){return"pending"!==a}});return $.when(g.go()).then(function(a){f.resolve(new c.DatasetCollection(a))}),f}});a.extend(p.prototype,i);var q=(Backbone.View.extend({}),Backbone.Collection.extend({model:p})),r=Backbone.Model.extend(i),s=Backbone.Model.extend({defaults:{elems:[],open:!1},clear_search_results:function(){a.each(this.attributes.elems,function(a){a.show()}),this.show(),this.set("open",!1)},apply_search_results:function(b){var c,d=!0;a.each(this.attributes.elems,function(a){a instanceof r?(c=a,c.hide()):a instanceof p&&a.apply_search_results(b)&&(d=!1,c&&c.show())}),d?this.hide():(this.show(),this.set("open",!0))}});a.extend(s.prototype,i);var t=Backbone.Model.extend({defaults:{search_hint_string:"search tools",min_chars_for_search:3,spinner_url:"",clear_btn_url:"",search_url:"",visible:!0,query:"",results:null,clear_key:27},urlRoot:Galaxy.root+"api/tools",initialize:function(){this.on("change:query",this.do_search)},do_search:function(){var a=this.attributes.query;if(a.length<this.attributes.min_chars_for_search)return void this.set("results",null);var b=a;this.timer&&clearTimeout(this.timer),$("#search-clear-btn").hide(),$("#search-spinner").show();var c=this;this.timer=setTimeout(function(){"undefined"!=typeof ga&&ga("send","pageview",Galaxy.root+"?q="+b),$.get(c.urlRoot,{q:b},function(a){c.set("results",a),$("#search-spinner").hide(),$("#search-clear-btn").show()},"json")},400)},clear_search:function(){this.set("query",""),this.set("results",null)}});a.extend(t.prototype,i);{var u=Backbone.Model.extend({initialize:function(a){this.attributes.tool_search=a.tool_search,this.attributes.tool_search.on("change:results",this.apply_search_results,this),this.attributes.tools=a.tools,this.attributes.layout=new Backbone.Collection(this.parse(a.layout))},parse:function(b){var c=this,d=function(b){var e=b.model_class;if(e.indexOf("Tool")===e.length-4)return c.attributes.tools.get(b.id);if("ToolSection"===e){var f=a.map(b.elems,d);return b.elems=f,new s(b)}return"ToolSectionLabel"===e?new r(b):void 0};return a.map(b,d)},clear_search_results:function(){this.get("layout").each(function(a){a instanceof s?a.clear_search_results():a.show()})},apply_search_results:function(){var a=this.get("tool_search").get("results");if(null===a)return void this.clear_search_results();var b=null;this.get("layout").each(function(c){c instanceof r?(b=c,b.hide()):c instanceof p?c.apply_search_results(a)&&b&&b.show():(b=null,c.apply_search_results(a))})}}),v=Backbone.View.extend({initialize:function(){this.model.on("change:hidden",this.update_visible,this),this.update_visible()},update_visible:function(){this.model.attributes.hidden?this.$el.hide():this.$el.show()}}),w=v.extend({tagName:"div",render:function(){var a=$("<div/>");if(a.append(f(this.model.toJSON())),"upload1"===this.model.id&&a.find("a").on("click",function(a){a.preventDefault(),Galaxy.upload.show()}),"upload1"!==this.model.id&&"Tool"===this.model.get("model_class")){var b=this;a.find("a").on("click",function(a){a.preventDefault();var c=new d.View({id:b.model.id,version:b.model.get("version")});c.deferred.execute(function(){Galaxy.app.display(c)})})}return this.$el.append(a),this}}),x=v.extend({tagName:"div",className:"toolPanelLabel",render:function(){return this.$el.append($("<span/>").text(this.model.attributes.text)),this}}),y=v.extend({tagName:"div",className:"toolSectionWrapper",initialize:function(){v.prototype.initialize.call(this),this.model.on("change:open",this.update_open,this)},render:function(){this.$el.append(g(this.model.toJSON()));var b=this.$el.find(".toolSectionBody");return a.each(this.model.attributes.elems,function(a){if(a instanceof p){var c=new w({model:a,className:"toolTitle"});c.render(),b.append(c.$el)}else if(a instanceof r){var d=new x({model:a});d.render(),b.append(d.$el)}}),this},events:{"click .toolSectionTitle > a":"toggle"},toggle:function(){this.model.set("open",!this.model.attributes.open)},update_open:function(){this.model.attributes.open?this.$el.children(".toolSectionBody").slideDown("fast"):this.$el.children(".toolSectionBody").slideUp("fast")}}),z=Backbone.View.extend({tagName:"div",id:"tool-search",className:"bar",events:{click:"focus_and_select","keyup :input":"query_changed","click #search-clear-btn":"clear"},render:function(){return this.$el.append(h(this.model.toJSON())),this.model.is_visible()||this.$el.hide(),this.$el.find("[title]").tooltip(),this},focus_and_select:function(){this.$el.find(":input").focus().select()},clear:function(){return this.model.clear_search(),this.$el.find(":input").val(""),this.focus_and_select(),!1},query_changed:function(a){return this.model.attributes.clear_key&&this.model.attributes.clear_key===a.which?(this.clear(),!1):void this.model.set("query",this.$el.find(":input").val())}}),A=Backbone.View.extend({tagName:"div",className:"toolMenu",initialize:function(){this.model.get("tool_search").on("change:results",this.handle_search_results,this)},render:function(){var a=this,b=new z({model:this.model.get("tool_search")});return b.render(),a.$el.append(b.$el),this.model.get("layout").each(function(b){if(b instanceof s){var c=new y({model:b});c.render(),a.$el.append(c.$el)}else if(b instanceof p){var d=new w({model:b,className:"toolTitleNoSection"});d.render(),a.$el.append(d.$el)}else if(b instanceof r){var e=new x({model:b});e.render(),a.$el.append(e.$el)}}),a.$el.find("a.tool-link").click(function(b){var c=$(this).attr("class").split(/\s+/)[0],d=a.model.get("tools").get(c);a.trigger("tool_link_click",b,d)}),this},handle_search_results:function(){var a=this.model.get("tool_search").get("results");a&&0===a.length?$("#search-no-results").show():$("#search-no-results").hide()}}),B=Backbone.View.extend({className:"toolForm",render:function(){this.$el.children().remove(),this.$el.append(e(this.model.toJSON()))}});Backbone.View.extend({className:"toolMenuAndView",initialize:function(){this.tool_panel_view=new A({collection:this.collection}),this.tool_form_view=new B},render:function(){this.tool_panel_view.render(),this.tool_panel_view.$el.css("float","left"),this.$el.append(this.tool_panel_view.$el),this.tool_form_view.$el.hide(),this.$el.append(this.tool_form_view.$el);var a=this;this.tool_panel_view.on("tool_link_click",function(b,c){b.preventDefault(),a.show_tool(c)})},show_tool:function(a){var b=this;a.fetch().done(function(){b.tool_form_view.model=a,b.tool_form_view.render(),b.tool_form_view.$el.show(),$("#left").width("650px")})}})}return{ToolParameter:j,IntegerToolParameter:m,SelectToolParameter:o,Tool:p,ToolCollection:q,ToolSearch:t,ToolPanel:u,ToolPanelView:A,ToolFormView:B}});
//# sourceMappingURL=../../../maps/mvc/tool/tools.js.map