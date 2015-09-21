function TaskBoard() {
	this.initialize.apply(this, arguments)
};
(function(Class) {

	Class.load = function() {
		var opts = {};
		var query = null;
		opts.project_id     = Control.getProjectId();
		opts.assigned_to_id = Control.getFilterUser();
		opts.status_id      = Control.getFilterClosed();
		Control.getFilterMasters(opts);
		opts.limit=100;

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
					story.childCount++;
				}
				MasterTable.register(issue);
			}

			var storyArray = [];
			for ( var storyId in storys) {
				storyArray.push(storys[storyId]);
			}
			storyArray.sort(function(a,b){
				if (b.issue == null || a.issue == null) return 0;
				return b.issue.priority.id - a.issue.priority.id;
			});



			$("#taskBoardTable").html($("<tbody/>"));
			var $table = $("#taskBoardTable>tbody");
			var statuses = MasterTable.getStatuses();
			var $tr = append($table, "<tr/>");
			var $td = append($tr, "<th/>");
			$td.text("Story");
			for ( var id in statuses.values) {
				var $td = append($tr, "<th/>");
				// console.log("statuses:",statuses.values[id]);
				$td.text(statuses.values[id]);
			}

			for ( var i=0; i<storyArray.length; i++) {
				// console.log("storyId:",storyId);
				var stroy = storyArray[i];
				var $tr = append($table, "<tr/>");
				var $td = append($tr, "<td/>");
				if (stroy.issue != null && stroy.childCount > 0) {
					$td.append(createKanban(stroy.issue));
				}
				for ( var stateId in stroy.status) {
					var $td = append($tr, "<td/>");
					for ( var taskId in stroy.status[stateId]) {
						// console.log("taskId:",taskId);
						var task = stroy.status[stateId][taskId];
						$td.append(createKanban(task));
					}
					// console.log("taskId:",stroy.childCount,
					// stroy.issue.status.id, stateId);
					if (stroy.issue != null && stroy.childCount == 0 && stroy.issue.status.id == stateId) {
						$td.append(createKanban(stroy.issue));
					}
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
			status : {}
		};
		var statuses = MasterTable.getStatuses();
		for ( var id in statuses.values) {
			story.status[id] = {};
		}
		story.childCount = 0;
		storys[storyId] = story;
		return story;
	}

	function createKanban(issue) {
		var $TEMPLATE = $("#templ_kanban");
		var $kanban = $TEMPLATE.clone();
		$kanban.find("#ticketId").text(issue.id);
		$kanban.find("#title").text(issue.subject);
		$kanban.find("#assigned").text(issue.assigned_to ? issue.assigned_to.name : "");
		$kanban.find("#assignedIcon").toggle(issue.assigned_to!=null);

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

		return $kanban;
	}

	$(".Kanban").live("dblclick", function() {
		var ticketId = $(this).find("#ticketId").text();
		// console.log("Kanban:",ticketId);
		var selection = window.getSelection();
		selection.collapse(document.body, 0);
		RedMine.openIssue(ticketId + "/edit");
	});

})(TaskBoard);
