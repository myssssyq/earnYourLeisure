//Document is the DOM can be accessed in the console with document.window.
// Tree is from the top, html, body, p etc.

//Problem: User interaction does not provide the correct results.
//Solution: Add interactivity so the user can manage daily tasks.
//Break things down into smaller steps and take each step at a time.


//Event handling, uder interaction is what starts the code execution.

var taskInput=document.getElementById("new-task");//Add a new task.
var rewardInput=document.getElementById("task-cost");//Reward for the task.
var taskForm=document.getElementById("create-reward");//Form.
var addButton=document.getElementsByTagName("button")[0];//first button
var incompleteTaskHolder=document.getElementById("incomplete-tasks");//ul of #incomplete-tasks

//New task list item
var createNewTaskElement=function(taskString, rewardString, id){

	var listItem=document.createElement("li");

	var p_label=document.createElement("p");

	//label
	var label=document.createElement("label");//label
	//
	var label_cost=document.createElement("label");
	//input (text)
	var editInput=document.createElement("input");//text
	//
	var p_buttons=document.createElement("p");
	//button.edit
	var editButton=document.createElement("button");//edit button
	//button.delete
	var deleteButton=document.createElement("button");//delete button
	//
	var useButton=document.createElement("button");

	listItem.className="incomplete-list"
	p_label.className="rewards-labels"

	label.setAttribute("data-id", id)

	label.innerText=taskString;
	label_cost.innerText="("+rewardString+")";

	//Each elements, needs appending
	editInput.type="text";

	editButton.innerText="Edit";//innerText encodes special characters, HTML does not.
	editButton.className="edit";
	deleteButton.innerText="Delete";
	deleteButton.className="delete";
	useButton.innerText="Use";
	useButton.className="use";

	p_label.appendChild(label)
	p_label.appendChild(label_cost)

	p_buttons.appendChild(editButton);
	p_buttons.appendChild(deleteButton);
	p_buttons.appendChild(useButton);

	//and appending.
	listItem.appendChild(p_label);
	listItem.appendChild(editInput);
	listItem.appendChild(p_buttons);
	return listItem;
}


function addTask(e) {
	e.preventDefault()
	console.log("Add Task...");
	//Create a new list item with the text from the #new-task:

	$.ajax({
			url: '/addReward',
			data: {"name" : taskInput.value, "cost": rewardInput.value},
			type: 'POST',
			success: function(response){
				var id = JSON.parse(response).id
				var listItem=createNewTaskElement(taskInput.value, rewardInput.value, id);
				incompleteTaskHolder.appendChild(listItem);
				bindTaskEvents(listItem);
				taskInput.value="";
				rewardInput.value="";
			},
			error: function(error){
				console.log(error);
			}
		});

}

//Edit an existing task.

var editTask=function(){
console.log("Edit Task...");
console.log("Change 'edit' to 'save'");


var listItem=this.parentNode.parentNode
var editInput=listItem.querySelector('input[type=text]');
var label=listItem.querySelector("label");
var containsClass=listItem.classList.contains("editMode");
		//If class of the parent is .editmode
		if(containsClass){
		//switch to .editmode
		//label becomes the inputs value.
			$.ajax({
					url: '/editReward',
					data: {"rewardID" : label.getAttribute("data-id"), "newName": editInput.value},
					type: 'POST',
					success: function(response){
						console.log(response);
					},
					error: function(error){
						console.log(error);
					}
				});
			label.innerText=editInput.value;
		}else{
			editInput.value=label.innerText;
		}
		//toggle .editmode on the parent.
		listItem.classList.toggle("editMode");
}




//Delete task.
var deleteTask=function(){
		console.log("Delete Task...");

		var listItem=this.parentNode.parentNode;
		var ul=listItem.parentNode;

		var label=listItem.querySelector("label");

		$.ajax({
				url: '/deleteReward',
				data: {"rewardID" : label.getAttribute("data-id")},
				type: 'POST',
				success: function(response){
					console.log(response);
				},
				error: function(error){
					console.log(error);
				}
			});

		//Remove the parent list item from the ul.
		ul.removeChild(listItem);

}

//

var useReward=function(){

		var listItem=this.parentNode.parentNode;
		var ul=listItem.parentNode;

		var label=listItem.querySelector("label");

		$.ajax({
				url: '/useReward',
				data: {"rewardID" : label.getAttribute("data-id")},
				type: 'POST',
				success: function(response){
					wallet.innerHTML = "Wallet: " + JSON.parse(response).wallet;
				},
				error: function(error){
					alert("You cant have less than zero points.")
				}
			});

}


//The glue to hold it all together.


//Set the click handler to the addTask function.
taskForm.addEventListener("submit",addTask);


var bindTaskEvents=function(taskListItem){
	console.log("bind list item events");
//select ListItems children
	var editButton=taskListItem.querySelector("button.edit");
	var deleteButton=taskListItem.querySelector("button.delete");
	var useButton=taskListItem.querySelector("button.use");

			//Bind editTask to edit button.
			editButton.onclick=editTask;
			//Bind deleteTask to delete button.
			deleteButton.onclick=deleteTask;
			//
			useButton.onclick=useReward;
}

//cycle over incompleteTaskHolder ul list items
	//for each list item
	for (var i=0; i<incompleteTaskHolder.children.length;i++){

		//bind events to list items chldren(tasksCompleted)
		bindTaskEvents(incompleteTaskHolder.children[i]);
	}






// Issues with usabiliy don't get seen until they are in front of a human tester.

//prevent creation of empty tasks.

//Shange edit to save when you are in edit mode.
