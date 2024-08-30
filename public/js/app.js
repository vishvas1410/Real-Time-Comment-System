
let username 
 let socket = io()
do {
    username = prompt('Enter your name: ')
} while(!username)

const textarea = document.querySelector('#textarea')
const submitBtn = document.querySelector('#submitBtn')
const commentBox = document.querySelector('.comment__box')

submitBtn.addEventListener('click', (e) => {
    e.preventDefault()
    let comment = textarea.value
    if(!comment) {
        return alert('please enter the comment')
    }
    postComment(comment)
})

function postComment(comment) {
    // Append to dom
    let data = {
        username: username,
        comment: comment
    }
    appendToDom(data)
    textarea.value = ''
    // Broadcast
    broadcastComment(data)
    // Sync with Mongo Db
    syncWithDb(data)

}

function fetchComments()
{
    fetch('/api/comments').then(res=>res.json()).then(result=>{
        result.forEach((comment) => {
            comment.time = comment.createdAt
            appendToDom(comment)
        });
    })

}

window.onload= fetchComments

function syncWithDb(data)
{
    const headers = {
        'Content-Type'  : 'application/json'
    }
    fetch('/api/comments',{ method:'Post',body:JSON.stringify(data),headers })
    .then(response => response.json()).then(result =>{
        console.log(result)
    })
}

function appendToDom(data) {
    let lTag = document.createElement('li')
    lTag.classList.add('comment', 'mb-3')

    let markup = `
                        <div class="card border-light mb-3">
                            <div class="card-body">
                                <h6>${data.username}</h6>
                                <p>${data.comment}</p>
                                <div>
                                    <img src="/img/clock.png" alt="clock">
                                    <small>${moment(data.time).format('LT')}</small>
                                </div>
                            </div>
                        </div>
    `
    lTag.innerHTML = markup

    commentBox.prepend(lTag)
}

function broadcastComment(data) {
    // Socket
    socket.emit('comment', data)
}

let TypingElem = document.querySelector('.typing')

let TimerId = null

const deBounce = (func,timer) =>{

    if(TimerId)
    {
        clearTimeout(TimerId)
    }

    TimerId= setTimeout(()=>{
        func()
    },timer)

    //console.log(TimerId);
    
}

socket.on('typing',(data)=>{
    TypingElem.innerHTML = `${data.username} is typing...`

    deBounce(()=>{
        TypingElem.innerText = ''
    },1000)
})
socket.on('comment',(data)=>{
    appendToDom(data)
})



textarea.addEventListener('keyup',(e)=>{

    socket.emit('typing',{ username })

})