var allLevels = [];
var jqGridHeight = $( window ).height() - 200;
$(document).ready(function() {
	defineGrid();
	jQuery("#hierarchyGrid").jqGrid('sortableRows', {
		 start: function( event, ui ) {
			var rowData = ui.item[0];
			var row_id = jQuery(rowData).attr("id");
			var gridname = getGridName(row_id)
			var rowIds = $("#" + gridname).getDataIDs();
			for (var i = 0; i < rowIds.length; i++) {
				$('#' + rowIds[i]).hide();
			}
			$(".ui-subgrid").remove();
		 },
		cancel: ".jqgrow.notsortable",
		update: function (ev, ui) {
			var item = ui.item[0];
            var ri = item.rowIndex;
            var rowId = this.rows[ri].id;
            var gridname = getGridName(rowId)
            var level = rowId.substring(0, rowId.indexOf('-'));
            var rowDataNew = $("#hierarchyGrid").getRowData(rowId);
            var rowDataIds = $("#hierarchyGrid").getDataIDs();
            var seq;
    	    for (var i = 0; i < rowDataIds.length; i++) {
    	    		var rowData = $("#hierarchyGrid").getRowData(rowDataIds[i]);
    	    		if (rowDataIds[i].indexOf('new_') == -1) {
    	    			seq =  i + 1;
    	    			$("#hierarchyGrid").jqGrid('setCell',  rowDataIds[i], 'seq', seq);
        	    		if (rowData.name == rowDataNew.name) {
        	    			$.ajax({
        	    		        url: "/ajax/edit_hierarchy_sequence?level=" +  level +  "&parent=0&seq=" + seq,
        	    		        type: 'GET',
        	    		        data: { },
        	    		        dataType: "json",
        	    		        cache: false,
        	    		        success: function (data) {
        	    		        	
        	    		    	}
        	    		    });	
        	    		}
    	    		}
    	    } 
	   }});
	
	$(".addButton").click(addLevel);
	$("#cancelKeywords").click(cancelKeywords);
	$("#saveKeywords").click(saveKeywords);
	getAllLevels();
	
	
	
});

//Define the main grid
function defineGrid () {
	$("#hierarchyGrid").jqGrid({
    datatype: "xml",
    url: '/xml/hierarchy_xml.php',
    height: jqGridHeight,
    width: "1000",
    colNames: ['', '','','', '', '', ''],
    colModel: [
            { name: 'name', index: 'name',  title: false, sortable: false, width: 700},
            { name: 'childrenDisplay', index: 'childrenDisplay',  title: false, sortable: false, width: 80, align:"center"},
            { name: 'edit', index: 'edit', width: 40, title: false, sortable: false, hidden: true},
            { name: 'delete', index: 'delete', width: 40, sortable: false, align:"center"},
            { name: 'assign', index: 'assign', width: 40, sortable: false, align: 'center', cellattr: function(rowId, tv, rawObject, cm, rdata) {
        		return 'title="Assign items to ' + rdata.name + '"'
        		}
            },
            { name: 'children', index: 'children', sortable: false, hidden: true},
            { name: 'seq', index: 'seq', sortable: false, hidden: true}
   ],
    caption: "",
    scrollable: true,
    loadonce: true,
    //sortable: true,
    rowNum: -1,
    hidegrid: false,
    hoverrows: false,
    onSelectRow: function(rowid, status) {
    	$('#' + rowid).removeClass('ui-state-highlight');
	},
	
    //subgrid stuff
    subGrid: true,
    subGridScrollable: true,
    subGridOptions: { 
        "reloadOnExpand" : true,
        "selectOnExpand" : true 
        },
     subGridRowExpanded: subGrid, //this calls the function to create the subgrid
	
	
   loadComplete: function(data) {  
        $(".trash" ).css('cursor', 'pointer');
        $(".trash").click(deleteLevel);
        $(".assign").click(assign);
   	  	$(".assign" ).css('cursor', 'pointer');
   	  	var rows = $("#hierarchyGrid").getDataIDs();
   	    var lastRow = rows.length - 1;
   	 
   	 var data = {name: "<button id='addParent'>Add</button> New Parent Hierarchy Level  <input type='text' id='addParentTxt' style='display: none'> <button id='saveNewParent' title='Save' style='display: none'>Save</button>  <button id='cancelNew' style='display:none'>Cancel</button>"};
   	 $('#hierarchyGrid').jqGrid('addRowData','0-new-0', data, 'after', rows[lastRow]);
   	 $("td.sgcollapsed","#0-new-0").empty().unbind('click');
   	 $("#addParent").bind('click',{}, addLevel);
   	 $("#saveNewParent").bind('click',{}, addParent);
   	 $("#cancelNew").bind('click',{}, cancelNew);
   	 $("#addParentTxt").autocomplete({
   		source: allLevels
   	 });
   	 
   }
  });
	//This is the function to call anytime there is a need for a subgrid.  The call is from the jqgrid
	//function itelf. This function will place a subgrid below the any existing subgrid
	function subGrid(subgrid_id, row_id) {  
		   var subgrid_table_id, pager_id; subgrid_table_id = subgrid_id+"_t";
	       pager_id = "p_"+subgrid_table_id;
	       $("#"+subgrid_table_id).jqGrid('navGrid',"#"+pager_id,{edit:false,add:false,del:false});
	       $("#"+subgrid_id).html("<table id='"+subgrid_table_id+"' class='scroll'></table><div id='"+pager_id+"' class='scroll'></div>");
	       $("#"+subgrid_table_id).jqGrid({
	        	url: '/xml/hierarchy_sub_xml.php?levels=' + row_id,
	            datatype: "xml",
	            colNames: ['','','','','','',''],
	            colModel: [
	                {name:"label",index:"label", title: false, sortable: false, width:20,align:"center"},
	                {name:"name",index:"name", title: false, sortable: false, cellattr: function(rowId, tv, rawObject, cm, rdata) {
	            		if (rowId.indexOf('A-') != -1 || rowId.indexOf('B-') != -1 || rowId.indexOf('C-') != -1 || rowId.indexOf('D-') != -1 || rowId.indexOf('E-') != -1) { 
	            			return 'colspan=3 class="editable";' 
	            			}
	        		}
	            },
	                {name:"childrenDisplay",index:"children", sortable: false, title: false, width:50,align:"center"},
	                {name:"children",index:"children", sortable: false, hidden: true},
	                {name:"delete",index:"delete", sortable: false, width:40,align:"center"},
	                {name:"assign",index:"assign", sortable: false, width:40,align:"center", cellattr: function(rowId, tv, rawObject, cm, rdata) {
	                	return 'title="Assign items to ' + rdata.name + '"'
	        			}
	                },
	                {name: 'seq', index: 'seq', sortable: false, hidden: true}
	                ], 
	            sortname: 'num',
	            sortorder: "asc", height: '100%',
	            autoencode:false,
	            hoverrows: false,
	            rowNum: 10000,
	            height: "auto",
	            width: "950",
	            loadonce: false,
	            subGrid: true,
	            subGridScrollable: true,
	            subGridRowExpanded: subGrid,
	            onSelectRow: function(rowid, status) {
	            	$('#' + rowid).removeClass('ui-state-highlight');	        	    
	        	},
	        	rowattr: function (rd) {
	                if (rd.label ==="Short" || rd.label ==="Long" || rd.label ==="Copy" || rd.label ==="Keywords") {
	                    return { "class": "notsortable" };
	                }
	                if (rd.name.indexOf("addChild") != -1) {
	                	return { "class": "notsortable" };
	                }
	            },
	            loadComplete: function(data) {
	              $(".save").unbind();
	              $(".saveKeywords").unbind();
	              $(".pencil").unbind();
	         	  $(".pencil").click(editItem);
	         	  $(".pencil" ).css('cursor', 'pointer');
	         	  $(".pencil_key").click(editKeywords);
	         	  $(".pencil_key").css('cursor', 'pointer');
	         	  $(".saveKeywords").click(saveKeywords);
	         	  $(".trash").click(deleteLevel);
	         	  $(".trash" ).css('cursor', 'pointer');
	         	  $(".close" ).css('cursor', 'pointer');
	         	  $(".assign").click(assign);
	         	  $(".assign" ).css('cursor', 'pointer');
	         	  $(".save").click(saveEdit);
	         	  $(".save" ).css('cursor', 'pointer');
	         	  $("td.sgcollapsed","#A-" + row_id).empty().unbind('click');
	         	  $("td.sgcollapsed","#B-" + row_id).empty().unbind('click');
	         	  $("td.sgcollapsed","#C-" + row_id).empty().unbind('click');
	         	  $("td.sgcollapsed","#D-" + row_id).empty().unbind('click');
	         	  $("td.sgcollapsed","#E-" + row_id).empty().unbind('click');
	         	  
	         	   var rows = $("#" + subgrid_table_id).getDataIDs();
		           var lastRow = rows.length - 1;
		           	
		           var n = subgrid_id.lastIndexOf("_");
		           var parentGrid = subgrid_id.replace(subgrid_id.substring(n), "");
		           
		            var parentData =  $('#' + parentGrid).getRowData(row_id);
		         	var data = {name: "<button id='addChild_" + row_id + "'>Add</button> New Child Level Under " + parentData.name + "  <input type='text' id='addChildTxt_" + row_id + "' style='display: none'> <button id='saveChild_" + row_id + "' style='display: none' class='saveChild' title='save'>Save</button>  <button id='cancelChild_" + row_id + "' style='display:none'>Cancel</button>"};
		         	   	
		        	$("#" + subgrid_table_id).jqGrid('addRowData','new_' +  row_id, data, 'after', rows[lastRow]);
		        	$('#' + subgrid_table_id).jqGrid('setCell',  'new_' +  row_id, 'name', '', '', {'colspan': 4});
		         	$("#addChild_" + row_id).bind('click',{}, addLevel);
		         	$("#cancelChild_" + row_id).bind('click',{}, cancelNew);
		          
		          	$("td.sgcollapsed","#new_" +  row_id).empty().unbind('click');
		          	$(".saveChild").unbind();
		          	$(".saveChild").click(saveChild);
		          	$("#addChildTxt_"  + row_id).autocomplete({
		           		source: allLevels
		           	 });
		          	$(".assign").unbind();
		          	$(".assign").click(assign);
		          			          	
	         	 collapseGrids();
	            }
	               
	         }).jqGrid('sortableRows', {
	        	 start: function( event, ui ) {
	     			var rowData = ui.item[0];
	     			var row_id = jQuery(rowData).attr("id");
	     			var gridname = getGridName(row_id)
	    			var rowIds = $("#" + gridname).getDataIDs();
	    			for (var i = 0; i < rowIds.length; i++) {
	    				$('#' + rowIds[i]).hide();
	    			}
	    			//$(".ui-subgrid").remove();
	     		 },
	        	cancel: ".jqgrow.notsortable",
	 	 		update: function (ev, ui) {
		            var item = ui.item[0];
		            var ri = item.rowIndex;
		            var rowId = this.rows[ri].id;
		            var parentLevels = rowId.substring(rowId.indexOf('-') + 1, rowId.length);
				    var levels = parentLevels.split("-");
				    var level = rowId.substring(0, rowId.indexOf('-'));
				    var gridname = getGridName(parentLevels);
				    var rowDataNew = $("#" + gridname).getRowData(rowId);
				    var rowDataIds = $("#" + gridname).getDataIDs();
				    var seq;
			       	for (var i = 0; i < rowDataIds.length; i++) {
			       	   	if (i <= 3 && rowDataIds[i].indexOf('A') ==-1 && rowDataIds[i].indexOf('B') == -1 && rowDataIds[i].indexOf('C') == -1 && rowDataIds[i].indexOf('D') == -1 ) {
				           	alert("You cannot move a row here");
				           }
			       	   	if (i > 3) {
			       	   		var rowData = $("#" + gridname).getRowData(rowDataIds[i]);
			       	   		if (rowDataIds[i].indexOf('new_') == -1) {
			       	   			seq =  i-3;
			       	   			$('#' + gridname).jqGrid('setCell',  rowDataIds[i], 'seq', seq);
				        		if (rowData.name == rowDataNew.name) {
				        			$.ajax({
				        		        url: "/ajax/edit_hierarchy_sequence?level=" +  level +  "&parent=" + levels[0] + "&seq=" + seq,
				        		        type: 'GET',
				        		        data: { },
				        		        dataType: "json",
				        		        cache: false,
				        		        success: function (data) {
				        		        	
				        		    	}
				        		    });	
				        		}
			       	   		}
			       	   		
			       	   	}
			       	}
		             
			   }});
	      
	     }
}
