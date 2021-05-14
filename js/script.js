let addItemform = document.querySelector("#addItemform");
let itemslist = document.querySelector('.actionItems');
let storage = chrome.storage.sync;
let actionItemsUtils = new ActionItems();

// chrome.storage.sync.clear();
storage.get(['actionItems', 'name'], (data) => {
  setgreetings();
  setgreetingimage();
  let actionItems = data.actionItems;
  let name = data.name;
  setusersname(name);
  createQuickActionListener();
  renderactionitems(actionItems);
  updatename();
  createupdatename();
  actionItemsUtils.setprogress();
  chrome.storage.onChanged.addListener(() => {
    actionItemsUtils.setprogress();
  })
});
const renderactionitems = (actionItems) => {
  const filtereditems = filteractionitems(actionItems);
  filtereditems.forEach((item) => {
    renderactionItem(item.text, item.id, item.completed, item.website);
  })
  chrome.storage.sync.set({
    actionItems:filtereditems,
  })
}
const filteractionitems= (actionItems)=> {
  let currentdate = new Date();
  currentdate.setHours(0,0,0,0);
  const filtereditems = actionItems.filter((item)=>{
    if(item.completed){
      const completedDate = new Date(item.completed);
      if(completedDate < currentdate){
        return false;
      }
    }
    return true;
  })
  return filtereditems
}
const handleQuickActionListener = (e) => {
  const text = e.target.getAttribute("data-text");
  const id = e.target.getAttribute("data-id");
  getCurrenttab().then((tab) => {
    actionItemsUtils.addQuickActionItem(id, text, tab, (actionItem) => {
      renderactionItem(actionItem.text, actionItem.id, actionItem.completed, actionItem.website,250);
    });
  })
}
const setusersname = (name) => {
  let newname = name ? name : "Add Name";
  document.querySelector(".name__class").innerText = newname;
}
const updatename = () => {
  let greetingname = document.querySelector(".greeting__name");
  greetingname.addEventListener("click", () => {
    storage.get(["name"], (data) => {
      let name = data.name ? data.name : "";
      document.getElementById("inputname").value = name;
    })
    $('#updatename').modal('show');
  })
}
const handleupdatename = (e) => {
  const name = document.getElementById('inputname').value;
  if (name) {
    actionItemsUtils.savename(name, () => {
      setusersname(name);
      $('#updatename').modal('hide');

    })
  }
}
const createupdatename = () => {
  let element = document.querySelector("#updatenamesave");
  element.addEventListener("click", handleupdatename)
}
const createQuickActionListener = () => {
  let buttons = document.querySelectorAll(".quick-action")
  buttons.forEach((button) => {
    button.addEventListener("click", handleQuickActionListener);
  })
}
async function getCurrenttab() {
  return await new Promise((resolve, reject) => {
    chrome.tabs.query({
      'active': true,
      'windowId': chrome.windows.WINDOW_ID_CURRENT
    }, (tabs) => {
      resolve(tabs[0]);
    })
  })
}
addItemform.addEventListener('submit', (e) => {
  e.preventDefault();
  let itemText = addItemform.elements.namedItem("itemText").value;
  if (itemText) {
    actionItemsUtils.add(itemText, null, (actionItem) => {
      renderactionItem(actionItem.text, actionItem.id, actionItem.completed, actionItem.website,250);
      addItemform.elements.namedItem("itemText").value = ""
    });
  }
})
const handleCompletedEventListener = (e) => {
  const id = e.target.parentElement.parentElement.getAttribute('data-id');
  const parent = e.target.parentElement.parentElement;
  if (parent.classList.contains('completed')) {
    actionItemsUtils.markUnmarkCompleted(id, null);
    parent.classList.remove('completed');
  } else {
    actionItemsUtils.markUnmarkCompleted(id, new Date().toString());
    parent.classList.add('completed');
  }
}
const handleDeleteEventListener = (e) => {
  const id = e.target.parentElement.parentElement.getAttribute('data-id');
  const parent = e.target.parentElement.parentElement;
  let Jelement = $(`div[data-id = "${id}"]`);
  actionItemsUtils.remove(id, () => {
    animateup(Jelement)
  });
}
const renderactionItem = (text, id, completed, website = null,animationduration=500) => {
  let element = document.createElement('div');
  element.classList.add('actionItem__Item');
  let mainelement = document.createElement('div');
  mainelement.classList.add('actionItem__main');
  let checkEl = document.createElement('div');
  checkEl.classList.add("actionItem__check");
  let textEl = document.createElement('div');
  textEl.classList.add("actionItem__text");
  let deleteEl = document.createElement('div');
  deleteEl.classList.add("actionItem__delete");
  checkEl.innerHTML = `
    <div class="actionItem__checkbox">
      <i class="fas fa-check" aria-hidden="true"></i>
    </div>
  `
  if (completed) {
    element.classList.add('completed');
  }
  element.setAttribute('data-id', id);
  checkEl.addEventListener('click', handleCompletedEventListener)
  textEl.textContent = text;
  deleteEl.innerHTML = `<i class="fas fa-times"></i>`
  deleteEl.addEventListener('click', handleDeleteEventListener);
  mainelement.appendChild(checkEl);
  mainelement.appendChild(textEl);
  mainelement.appendChild(deleteEl);
  element.appendChild(mainelement);
  if (website) {
    let linkcontainer = createlinkcontainer(website)
    element.appendChild(linkcontainer);
  }
  itemslist.prepend(element);
  let Jelement = $(`div[data-id = "${id}"]`);
  animatedown(Jelement,animationduration);
}
const createlinkcontainer = (website) => {
  let element = document.createElement('div');
  element.classList.add("actionItem__linkcontainer");
  element.innerHTML = `
    <a href="${website.url}" target= _blank ">
      <div class="actionItem__link">
        <div class="actionItem__favicon">
          <img src = "${website.fav_icon}" />
        </div>
        <div class="actionItem__title">
          <span>${website.title}</span>
        </div>
      </div>
    </a>
  `
  return element;
}
const setgreetings = () => {
  let greetingname = document.querySelector(".greeting__type");
  let today = new Date();
  let time = today.getHours()
  if (time >= 5 && time <= 11) {
    greetingname.innerText = "Good Morning,"
  } else if (time >= 12 && time <= 16) {
    greetingname.innerText = "Good Afternoon,"
  } else if (time >= 17 && time <= 20) {
    greetingname.innerText = "Good Evening,"
  } else {
    greetingname.innerText = "Good Night,"
  }
}
const setgreetingimage = () => {
  let image = document.getElementById("greeting_image");
  let today = new Date();
  let time = today.getHours()
  if (time >= 5 && time <= 11) {
    image.src = "../images/good-morning.png"
  } else if (time >= 12 && time <= 16) {
    image.src = "../images/good-afternoon.png"
  } else if (time >= 17 && time <= 20) {
    image.src = "../images/good-evening.png"
  } else {
    image.src = "../images/good-night.png"
  }
}
const animatedown =(element,duration)=> {
  let height = element.innerHeight();
  element.css({marginTop: `-${height}px`, opacity:0}).animate({
    opacity:1,
    marginTop:"12px",
  },duration)
}
const animateup=(element)=> {
  const height = element.innerHeight();
  element.animate({
    opacity:0,
    marginTop:`-${height}px`
  },250,()=> {
    element.remove();
  })
}