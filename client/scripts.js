const preparePrivateMessage = to => {
    const input = document.getElementById("input");

    input.value = `!sendTo ${to} `;
    input.focus();
}

const app = () => {
    const socket = io();

    const messages = document.getElementById('messages');
    const onlineUsersList = document.getElementById("online-users-list");
    const form = document.getElementById("form");
    const input = document.getElementById("input");
    
    const username = prompt("Please enter your username");

    let typing = false;
    let timeout = undefined;

    const addMessage = msg => {
        const item = document.createElement('li');
        item.textContent = msg;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    }

    if (!username) {
        window.location.href = "forbidden.html";
    };
    socket.emit('user connected', username);

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (input.value) {
            const message = input.value;
            addMessage(`${username}: ${message}`)
            socket.emit('chat message', message);
            input.value = '';
        }
    });

    input.addEventListener('keydown', e => {
        if (e.key === "Enter") {
            socket.emit('user is typing', false);
            return;
        }
        if (!typing) {
            typing = true;
            socket.emit('user is typing', true);
            timeout = setTimeout(() => {
                typing = false;
                socket.emit('user is typing', false);
            }, 1000)
        } else {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                typing = false;
                socket.emit('user is typing', false);
            }, 1000);
        }
    });

    
    socket.on('chat message', msg => addMessage(msg));

    socket.on('update users list', users => {
        onlineUsersList.innerHTML = "";
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const item = document.createElement('li');
            item.innerHTML = `<a href="#" onclick="preparePrivateMessage('${user}')">${user}</a>`;
            onlineUsersList.appendChild(item);
        }
    });

    socket.on('update users typing list', users => {
        const usersExceptThis = users.filter(user => user !== username);
        const typingMessage = document.getElementById("typingMessage");
        const firstUserTyping = usersExceptThis[0];
        if (firstUserTyping) {
            typingMessage.innerHTML = `${firstUserTyping} is typing...`;
            return;
        }
        typingMessage.innerHTML = "";
    });
}

app();