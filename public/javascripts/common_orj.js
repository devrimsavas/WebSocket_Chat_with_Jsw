// Define the getCookie function to read a cookie by name
function getCookie(name) {
    let cookieArray = document.cookie.split(';');
    for(let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name + "=") == 0) {
            return cookie.substring(name.length + 1, cookie.length);
        }
    }
    return "";
}

document.addEventListener('DOMContentLoaded', function() {

    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    if (name) {
        document.getElementById('welcomeMessage').textContent = `Welcome to the Chat Page, ${decodeURIComponent(name)}!`;
    }

    const socket = io({ query: { token: getCookie('token') } });

    document.getElementById('form').addEventListener('submit', function(e) {
        e.preventDefault();
        var input = document.getElementById('input');
        if (input.value) {
            socket.emit('chat message', input.value);
            input.value = '';
        }
    });

    // Handle incoming messages
    socket.on('chat message', function(data) {
        var item = document.createElement('p');
        item.textContent = `${data.name}: ${data.text}`;
        item.classList.add("testClass");
        document.getElementById('messages').appendChild(item);
        
    });

    // Handle online user list updates
    socket.on('online users', function(users) {
        var userList = document.getElementById('users'); // Make sure this exists in your HTML
        userList.innerHTML = ''; // Clear current list
        users.forEach(function(user) {
            var userItem = document.createElement('li');
            userItem.textContent = user;
            userList.appendChild(userItem);
        });
    });
});
