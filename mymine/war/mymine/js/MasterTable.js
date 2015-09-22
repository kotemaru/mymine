
function MasterTable(){this.initialize.apply(this, arguments)};
(function(Class){


	Class.init = function(){
	}

	Class.register = function(issue) {
		put("assigned_to", issue.assigned_to);
		put("author", issue.assigned_to);
		put("assigned_to", issue.author);
		put("author", issue.author);
		put("status", issue.status);
		put("tracker", issue.tracker);
		put("priority", issue.priority);
		put("fixed_version", issue.fixed_version);

		if (issue.custom_fields){
			for (var i=0; i<issue.custom_fields.length; i++) {
				var cf = issue.custom_fields[i];
				var type = "cf_"+cf.id;
				var data = {disp:cf.name, id:cf.value, name:cf.value};
				put(type, data);
			}
		}
	}

	var MASTER_TABLE_BASE = {
		assigned_to:{name:"担当者",  idSuf:"_id",  keySort:"name", icon:"img/led24/user.png", values:{} },
		author:     {name:"作成者",  idSuf:"_id",  keySort:"name", icon:"img/led24/user_business.png", values:{} },
		tracker:    {name:"トラッカー", idSuf:"_id", keySort:"id", icon:"img/dog.png", values:{} },
		status:     {name:"進捗",      idSuf:"_id", keySort:"id", icon:"img/progress.png", values:{} },
		priority:   {name:"優先度",    idSuf:"_id", keySort:"id", icon:"img/priority.png", values:{} },
		fixed_version:    {name:"バージョン", idSuf:"_id", keySort:"name", icon:"img/led24/target.png", values:{} }
	};

	var masterTable = null;

	Class.getMasterTable = function() {
		return masterTable;
	}

	Class.getTrackerId = function(name) {
		var values = masterTable["tracker"].values;
		for (var id in values) {
			if (values[id].name == name) return id;
		}
		return -1;
	}
	Class.getCustomFieldId = function(name) {
		for (var key in masterTable) {
			if (key.indexOf("cf_") == 0 && masterTable[key].name == name) {
				return key;
			}
		}
		return null;
	}
	Class.getStatuses = function() {
		return masterTable["status"];
	}


	function put(type, data) {
		if (data == null) return;
		if (masterTable[type] == null) {
			masterTable[type] = {name:data.disp, idSuf:"", icon:"", values:{}};
		}
		if (masterTable[type].values[data.id]) return;
		masterTable[type].values[data.id] = data.name;
		if (data.disp) {
			masterTable[type].name = data.disp;
		}
		save();
	}
	Class.put = put;

	function save() {
		Storage.put("MasterTable", masterTable);
	}
	function load() {
		masterTable = Storage.get("MasterTable", MASTER_TABLE_BASE);
	}

	$(function(){
		load();
		initUsers();
		initTrackers();
		initStatuses();
		initCustomField();
	});

	function initUsers() {
		RedMine.getMaster("users", function(data) {
			var values = data.users;
			for (var i = 0; i < values.length; i++) {
				var user = {
						id : values[i].id,
						name : values[i].firstname + " " + values[i].lastname
					};
				put("author", user);
				put("assigned_to", user);
			}
		});
	}
	function initTrackers() {
		RedMine.getMaster("trackers", function(data) {
			var values = data.trackers;
			for (var i=0; i<values.length; i++) {
				put("tracker", values[i]);
			}
		});
	}
	function initStatuses() {
		RedMine.getMaster("issue_statuses", function(data) {
			var values = data.issue_statuses;
			for (var i=0; i<values.length; i++) {
				put("status", values[i]);
			}
		});
	}
	function initCustomField() {
		RedMine.getMaster("custom_fields", function(data) {
			for (var j=0; j<data.custom_fields.length; j++) {
				var cf = data.custom_fields[j];
				var values = cf.possible_values;
				if (values == null) continue;
				for (var i=0; i<values.length; i++) {
					var dataSet = {disp:cf.name, id:values[i].value, name:values[i].value};
					put("cf_"+cf.id, dataSet);
				}
			}
		});
	}
})(MasterTable);


