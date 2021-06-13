//Document is the DOM can be accessed in the console with document.window.
// Tree is from the top, html, body, p etc.

//Problem: User interaction does not provide the correct results.
//Solution: Add interactivity so the user can manage daily tasks.
//Break things down into smaller steps and take each step at a time.


//Event handling, uder interaction is what starts the code execution.

var taskInput=document.getElementById("new-task");//Add a new task.
var rewardInput=document.getElementById("task-cost");//Reward for the task.
var taskForm=document.getElementById("create-task");//Form.
var addButton=document.getElementsByTagName("button")[0];//first button
var incompleteTaskHolder=document.getElementById("incomplete-tasks");//ul of #incomplete-tasks
var completedTasksHolder=document.getElementById("completed-tasks");//completed-tasks
var wallet=document.getElementById("wallet");//completed-tasks

//New task list item
var createNewTaskElement=function(taskString,rewardString, id){

	var listItem=document.createElement("li");

	//input (checkbox)
	var checkBox=document.createElement("input");//checkbx
	//
	var p=document.createElement("p");
	//label
	var label=document.createElement("label");//label
	//
	var label_reward=document.createElement("label");
	//input (text)
	var editInput=document.createElement("input");//text
	//button.edit
	var editButton=document.createElement("button");//edit button

	//button.delete
	var deleteButton=document.createElement("button");//delete button

	label.setAttribute("data-id", id)

	label.innerText=taskString;
	label_reward.innerText=": "+rewardString

	p.appendChild(label)
	p.appendChild(label_reward)


	listItem.className="incomplete-list";

	//Each elements, needs appending
	checkBox.type="checkbox";
	editInput.type="text";

	editButton.innerText="Edit";//innerText encodes special characters, HTML does not.
	editButton.className="edit";
	deleteButton.innerText="Delete";
	deleteButton.className="delete";



	//and appending.
	listItem.appendChild(checkBox);
	listItem.appendChild(p);
	listItem.appendChild(editInput);
	listItem.appendChild(editButton);
	listItem.appendChild(deleteButton);
	return listItem;
}


function addTask(e) {
	e.preventDefault()
	console.log("Add Task...");
	//Create a new list item with the text from the #new-task:

	$.ajax({
			url: '/addGoal',
			data: {"name" : taskInput.value, "reward": rewardInput.value},
			type: 'POST',
			success: function(response){
				var id = JSON.parse(response).id
				var listItem=createNewTaskElement(taskInput.value, rewardInput.value, id);
				incompleteTaskHolder.appendChild(listItem);
				bindTaskEvents(listItem, taskCompleted);
				taskInput.value="";
				rewardInput.value="";
			},
			error: function(error){
				console.log(error);
			}
		});

	//Append listItem to incompleteTaskHolder

}

//Edit an existing task.

var editTask=function(){
console.log("Edit Task...");
console.log("Change 'edit' to 'save'");


var listItem=this.parentNode;

var editInput=listItem.querySelector('input[type=text]');
var label=listItem.querySelector("label");
var containsClass=listItem.classList.contains("editMode");
		//If class of the parent is .editmode
		if(containsClass){

		//switch to .editmode
		//label becomes the inputs value.
			$.ajax({
					url: '/editGoal',
					data: {"goalID" : label.getAttribute("data-id"), "newName": editInput.value},
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

		var listItem=this.parentNode;
		var ul=listItem.parentNode;

		var label=listItem.querySelector("label");

		$.ajax({
				url: '/deleteGoal',
				data: {"goalID" : label.getAttribute("data-id")},
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


//Mark task completed
var taskCompleted=function(){
		console.log("Complete Task...");

	//Append the task list item to the #completed-tasks
	var listItem=this.parentNode;
	var ul=listItem.parentNode;

	var label=listItem.querySelector("label");

	$.ajax({
			url: '/completeGoal',
			data: {"goalID" : label.getAttribute("data-id")},
			type: 'POST',
			success: function(response){
				wallet.innerHTML = "Wallet: " + JSON.parse(response).wallet;
			},
			error: function(error){
				console.log(error);
			}
		});
	completedTasksHolder.appendChild(listItem);
				bindTaskEvents(listItem, taskIncomplete);

}


var taskIncomplete=function(){
		console.log("Incomplete Task...");
//Mark task as incomplete.
	//When the checkbox is unchecked
		//Append the task list item to the #incomplete-tasks.
		var listItem=this.parentNode;
		var ul=listItem.parentNode;

		var label=listItem.querySelector("label");

		$.ajax({
				url: '/incompleteGoal',
				data: {"goalID" : label.getAttribute("data-id")},
				type: 'POST',
				success: function(response){
					wallet.innerHTML = "Wallet: " + JSON.parse(response).wallet;
					incompleteTaskHolder.appendChild(listItem);
					bindTaskEvents(listItem,taskCompleted);
				},
				error: function(error){
					alert("You cant have less than zero points.")
				}
			});
}

//The glue to hold it all together.


//Set the click handler to the addTask function.
taskForm.addEventListener("submit",addTask);


var bindTaskEvents=function(taskListItem,checkBoxEventHandler){
	console.log("bind list item events");
//select ListItems children
	var checkBox=taskListItem.querySelector("input[type=checkbox]");
	var editButton=taskListItem.querySelector("button.edit");
	var deleteButton=taskListItem.querySelector("button.delete");


			//Bind editTask to edit button.
			editButton.onclick=editTask;
			//Bind deleteTask to delete button.
			deleteButton.onclick=deleteTask;
			//Bind taskCompleted to checkBoxEventHandler.
			checkBox.onchange=checkBoxEventHandler;
}

//cycle over incompleteTaskHolder ul list items
	//for each list item
	for (var i=0; i<incompleteTaskHolder.children.length;i++){

		//bind events to list items chldren(tasksCompleted)
		bindTaskEvents(incompleteTaskHolder.children[i],taskCompleted);
	}




//cycle over completedTasksHolder ul list items
	for (var i=0; i<completedTasksHolder.children.length;i++){
	//bind events to list items chldren(tasksIncompleted)
		bindTaskEvents(completedTasksHolder.children[i],taskIncomplete);
	}




// Issues with usabiliy don't get seen until they are in front of a human tester.

//prevent creation of empty tasks.

//Shange edit to save when you are in edit mode.
