function timeSince(date) {

    if (typeof date !== 'object') {
        date = new Date(date);
    }

    let seconds = Math.floor((new Date() - date) / 1000);
    let intervalType;

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        intervalType = 'y';
    } else {
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            intervalType = 'month';
        } else {
            interval = Math.floor(seconds / 86400);
            if (interval >= 1) {
                intervalType = 'd';
            } else {
                interval = Math.floor(seconds / 3600);
                if (interval >= 1) {
                    intervalType = "h";
                } else {
                    interval = Math.floor(seconds / 60);
                    if (interval >= 1) {
                        intervalType = "m";
                    } else {
                        interval = seconds;
                        intervalType = "s";
                    }
                }
            }
        }
    }

    // console.log(interval + ' ' + intervalType);
    return interval + '' + intervalType;
};

function handleDelete(id) {
    console.log("Delete was triggered with id", id);

    fetch(`/poems/${id}`, {
            method: "DELETE"
        })
        .then((resp) => {
            console.log(resp);
            if (resp.redirected) {
                window.location.href = resp.url;
            }
        })
        .catch((err) => console.log(err));
}

function readPoem(id) {
    console.log("read poem was triggered", id);

    fetch(`/poems/${id}`, {
            method: "GET"
        })
        .then((res) => {
            console.log(res);
            // if (res.redirected) {
            //     window.location.href = res.url;
            // }
        })
        .catch((err) => console.log(err));
}

function menuOnClick() {
    const navDiv = document.getElementById('navDiv');
    const menuIcon = document.getElementById('menuIcon');
    if (navDiv.hidden) {
        navDiv.hidden = false;
        menuIcon.classList = ""
        menuIcon.innerText = "X";
    } else {
        navDiv.hidden = true;
        menuIcon.classList = "fas fa-solid fa-bars";
        menuIcon.innerText = "";
    }
}

const changeUserForm = document.getElementById('changeUserForm')
const deleteUserForm = document.getElementById('deleteUserForm')

function deleteUser(id) {

    console.log("Delete user was triggered with id", id);
    deleteUserForm.onsubmit = (e) => {
        e.preventDefault()
        fetch(`/account/${id}/deleted`, {
            method: "DELETE"
        })
        .then((resp) => {
            console.log(resp);
            if (resp.redirected) {
                window.location.href = resp.url;
            }
        })
        .catch((err) => console.log(err));
    }
}

function updateUser(id) {

    changeUserForm.onsubmit = (e) => {
        e.preventDefault()
        const changeUsername = document.getElementById('changeUsername').value
        const newPassword = document.getElementById('newpw').value
        const oldPassword = document.getElementById('oldpw').value
        fetch(`/account/${id}/updated`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json", // let server know that body is a string of json
                },
                body: JSON.stringify({
                    username: changeUsername,
                    oldPassword: oldPassword,
                    newPassword: newPassword,
                    id: id
                }),
            })
            .then(res => {
                console.log(res)
                if (res.redirected) {
                    window.location.href = res.url;
                }
            })
            .catch((err) => console.error(err));
    }
}

const createPoemForm = document.getElementById('addForm');
const lyricButtons = document.getElementById('lyricButtons');
const lyricH4 = document.getElementById('lyricH4');
const textAreaDiv = document.getElementById('textAreaDiv');
const startCreateBtn = document.getElementById('startCreateBtn');
const editContainer = document.getElementById('editContainer')
const inputTitle = document.getElementById('createTitle');
const inputPoem = document.getElementById('createpoem');
const editPoem = document.getElementById('editPoem');
const editedPoem = document.getElementById('editedPoem');
const radioButtons = document.querySelectorAll('input[name="visibility"]')

function getLyric(str) {
    fetch('lyrics.json')
        .then(res => res.json())
        .then(data => {
            let chosenSong = data.filter(song => song.title === str)
            chosenSong.map(info => {
                inputPoem.innerText = info.lyrics
            })
        })
}

if(createPoemForm !== null) {
createPoemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    createPoemForm.style.display = 'none';
    inputPoem.style.display = 'none';
    startCreateBtn.style.display = 'none';
    lyricButtons.style.display = 'none';
    lyricH4.style.display = 'none';
    editContainer.hidden = false;

    const h2Tag = document.createElement('h2');
    h2Tag.innerText = inputTitle.value.trim();
    h2Tag.setAttribute('id', 'h2Title')

    editContainer.prepend(h2Tag)
    editPoem.innerText = inputPoem.innerText;
})
}

if(editPoem) {
    editPoem.addEventListener("mouseup", onMouseUp, false)
}

function onMouseUp() {
    const activeTextarea = document.activeElement;
    const selection = activeTextarea.value.substring(
        activeTextarea.selectionStart, activeTextarea.selectionEnd)

    if (selection.length > 1) {
        editedPoem.value += `${selection.trim()}\n`
        // editedPoem.value += `${selection.trim()}`
    }

}

function tryagain() {
    editedPoem.value = "";
}

function newPoemValue() {
    console.log(editedPoem.textContent)
    const h2Title = document.getElementById('h2Title')

    let visibilityValue;
    for (const radioButton of radioButtons) {
        if (radioButton.checked) {
            visibilityValue = radioButton.value;
            break;
        }
    }

    console.log(visibilityValue, editedPoem.innerText)

    fetch('/createpoem', {
            method: "POST",
            headers: {
                "Content-Type": "application/json", // let server know that body is a string of json
            },
            body: JSON.stringify({
                name: h2Title.textContent,
                poem: editedPoem.value,
                visibility: visibilityValue
            }),
        })
        .then((res) => {
            console.log(res);
            if (res.redirected) {
                window.location.href = res.url;
            }
        })
        .catch((err) => console.error(err));
}

// function handleDelete(id) {
//     console.log("Delete was triggered with id", id);

//     fetch(`/poems/${id}`, {
//             method: "DELETE"
//         })
//         .then((resp) => {
//             console.log(resp);
//             if (resp.redirected) {
//                 window.location.href = resp.url;
//             }
//         })
//         .catch((err) => console.log(err));
// }

// function readPoem(id) {
//     console.log("read poem was triggered", id);

//     fetch(`/poems/${id}`, {
//             method: "GET"
//         })
//         .then((res) => {
//             console.log(res);
//             // if (res.redirected) {
//             //     window.location.href = res.url;
//             // }
//         })
//         .catch((err) => console.log(err));
// }



function handleEdit(id) {
    const editFormEl = document.getElementById("editForm");
    const oldPoem = document.getElementById('thePoem')
    const oldName = document.getElementById('theTitle')
    const oldVisibility = document.getElementById('visibility').textContent
    const editBtn = document.getElementById('editBtn')

    oldPoem.contentEditable = "true";
    oldPoem.focus()
    oldName.contentEditable = "true";
    editBtn.hidden = true;

    // Show edit form
    document.getElementById("editForm").hidden = false;
    editFormEl.elements.visibility.value = oldVisibility;
    console.log(oldVisibility)

    // Setup submit handler for edit form
    editFormEl.onsubmit = (e) => {
        e.preventDefault();

        const newName = oldName.innerText
        const newPoem = oldPoem.innerText
        const newVisibility = editFormEl.elements.visibility.value

        console.log(newVisibility.length)

        // tip: use fetch
        fetch(`/poems/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json", // let server know that body is a string of json
                },
                body: JSON.stringify({
                    name: newName,
                    poem: newPoem,
                    visibility: newVisibility
                }),
            })
            .then(res => {
                console.log(res)
                if (res.redirected) {
                    window.location.href = res.url;
                }
            })
            .catch((err) => console.error(err));
    };
}

// document.getElementById('thePoem').textContent = document.getElementById('thePoem').textContent.replace(/^\s+/mg,
//     "");
const comment = document.getElementById('commentTextArea');
const commentForm = document.getElementById('commentForm')
console.log(comment)

function postComment(id) {
console.log('this is the function post comment')
    commentForm.onsubmit = (e) => {
        e.preventDefault()
        fetch(`/poems/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json", // let server know that body is a string of json
                },
                body: JSON.stringify({
                    comment: comment.value,
                    id: id
                }),
            })
            .then((res) => {
                console.log('response', res)
                if (res.redirected) {
                    window.location.href = res.url;
                    console.log('was redirected')
                }
            })
            .catch((err) => console.error(err));

    }
}
