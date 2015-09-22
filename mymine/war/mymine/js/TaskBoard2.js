function TaskBoard() {
	this.initialize.apply(this, arguments)
};
(function(Class) {

	Class.update = function() {
		var opts = {};
		var query = null;
		opts.project_id = Control.getProjectId();
		opts.assigned_to_id = Control.getFilterUser();
		opts.status_id = "*"; // Control.getFilterClosed();
		Control.getFilterMasters(opts);
		opts.limit = 100;

		RedMine.getIssues(function(resData) {
			var issues = resData.issues;
			var storys = {};
			for (var i = 0; i < issues.length; i++) {
				var issue = issues[i];
				if (issue.parent == null) {
					var story = createStory(storys, issue.id);
					story.issue = issue;
				} else {
					var storyId = issue.parent.id;
					var story = createStory(storys, storyId);
					story.status[issue.status.id][issue.id] = issue;
					story.children.push(issue);
					story.childCount++;
				}
				MasterTable.register(issue);
			}

			var storyArray = [];
			for ( var storyId in storys) {
				storyArray.push(storys[storyId]);
			}
			storyArray.sort(function(a, b) {
				if (b.issue == null && a.issue == null) return 0;
				if (b.issue != null) return -1;
				if (a.issue != null) return 1;
				//return b.issue.priority.id - a.issue.priority.id;
				return b.issue.id - a.issue.id;
			});

			$("#taskBoardTable").html($("<tbody/>"));
			var $table = $("#taskBoardTable>tbody");
			var statuses = MasterTable.getStatuses();
			var $tr = append($table, "<tr/>");
			var $td = append($tr, "<th/>");
			$td.text("Story");

			var $td = append($tr, "<th style='text-align:left;'/>");
			var statuses = MasterTable.getStatuses();
			for ( var i=0 ; i<statusList.length; i++) {
				$td.append($("<span style='display:inline-block;width:200px;text-align:center;'>"+statusList[i]+"</span>"));
			}

			for (var i = 0; i < storyArray.length; i++) {
				var story = storyArray[i];
				var $tr = append($table, "<tr/>");
				var $td = append($tr, "<td/>");
				if (story.issue != null && story.childCount > 0) {
					$td.append(createKanban(story.issue));
				}
				var $td = append($tr, "<td/>");
				//console.log("story.children.length:",story.children.length,story.childCount);
				if (story.children.length > 0) {
					for (var j = 0; j < story.children.length; j++) {
						$td.append(createKanban(story.children[j],{tab:true}));
					}
				} else if (story.issue != null) {
					$td.append(createKanban(story.issue,{tab:true}));
				}
			}
		}, query, opts);
	}

	function append($parent, child) {
		var $child = $(child);
		$parent.append($child);
		return $child;
	}

	function createStory(storys, storyId) {
		if (storys[storyId] != null) return storys[storyId];
		var story = {
			status : {},
			children : []
		};
		var statuses = MasterTable.getStatuses();
		for ( var id in statuses.values) {
			story.status[id] = {};
		}
		story.childCount = 0;
		storys[storyId] = story;
		return story;
	}

	function createKanban(issue, opt) {
		var $TEMPLATE = $("#templ_kanban");
		var $kanban = $TEMPLATE.clone();
		$kanban.find("#ticketId").text(issue.id);
		$kanban.find("#title").text(issue.subject);
		$kanban.find("#assigned").text(issue.assigned_to ? issue.assigned_to.name : "");
		$kanban.find("#assignedIcon").toggle(issue.assigned_to != null);

		var colors = {
			1 : "#e0e0ff",
			2 : "#f0fff0",
			3 : "#fffff0",
			4 : "#fff0f0",
			5 : "#ffa0a0"
		};
		var color = colors[issue.priority.id];
		if (color != null) {
			$kanban.css("background-color", color);
		}

		var icon = "img/led24/page.png";
		var tracker = issue.tracker.name;
		if (tracker == "Bug" || tracker == "バグ") icon = "img/led24/bug.png";
		if (tracker == "Task" || tracker == "タスク") icon = "img/led24/doc_page.png";
		$kanban.find("#tracker").attr("src", icon);

		if (opt && opt.tab) {
			var index = getStateIndex(issue);
			if (index >= 0) {
				$kanban.css("margin-left", (index*200+2)+"px");
			} else {
				$kanban.css("margin-left", "-100px");
			}
		} else {
			$kanban.css("margin-left", "2px");
		}
		return $kanban;
	}

	var statusList = [];
	function getStateIndex(issue) {
		for (var i=0;i<statusList.length; i++) {
			if (statusList[i] == issue.status.name) return i;
		}
		return -1;
	}

	Class.statusListStr = "";
	function load() {
		var config = Storage.get("TaskBoard");
		if (config != null) {
			Class.statusListStr = config.statusListStr;
		}
		if (Class.statusListStr == null || Class.statusListStr == "") {
			statusList = [];
			var values = MasterTable.getStatuses().values;
			for (var id in values) statusList.push(values[id]);
		} else {
			statusList = eval(Class.statusListStr);
		}
	}
	Class.save = function save() {
		Storage.put("TaskBoard", {
			statusListStr: Class.statusListStr
		});
	}

	$(function(){
		load();

		$(".Kanban").live("dblclick", function() {
			var ticketId = $(this).find("#ticketId").text();
			// console.log("Kanban:",ticketId);
			var selection = window.getSelection();
			selection.collapse(document.body, 0);
			RedMine.openIssue(ticketId + "/edit");
		});
	});


})(TaskBoard);
