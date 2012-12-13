$(function(){
	$("h2").addClass("Mokuji");
	$("h3").addClass("Mokuji");
	$("h4").addClass("Mokuji");
	
	makeMokuji();
});
function makeMokuji() {
	var num = {H2:0, H3:0, H4:0};
	var $mokuji = $("#mokuji");
	$mokuji.html("");	
	$(".Mokuji").each(function(){
		var hn = this.tagName;
		var hash = null;
		if (hn == "H2") {
			num.H2++;
			num.H3=0;
			num.H4=0;
			hash = num.H2+".";
		} else if (hn == "H3") {
			num.H3++;
			num.H4=0;
			hash = num.H2+"."+num.H3;
		} else if (hn == "H4") {
			num.H4++;
			hash = num.H2+"."+num.H3+"."+num.H4;
		}
		
		var $this = $(this);
		$this.text(hash+" "+$this.text());
		$("<a/>").attr("name",hash).insertBefore($this);
		
		var $line = $("<div><a/></div>");
		var $a = $line.find("a");
		$a.text($this.text()).attr("href","#"+hash);
		$line.addClass("Mokuji_"+hn);
		$mokuji.append($line);
	});
}
