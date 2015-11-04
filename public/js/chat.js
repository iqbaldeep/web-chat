window.onload = function() {
 
    var messages = [];
    var parser = location;
    var socketListenUrl = parser.protocol+"//"+parser.host+"/";
    console.log("socketListenUrl="+socketListenUrl);
    var socket = io.connect(socketListenUrl);
    var field = document.getElementById("field");
    var sendButton = document.getElementById("send");
    var content = document.getElementById("content");
    var name = document.getElementById("name");
    var displayImg = document.getElementById("imgUrl");
    if( ! displayImg.src){
    	displayImg.style.display="none";
    }
    var verified = false;
 
    socket.on('message', function (data) {
        if(data.message) {
            messages.push(data);
            var html = '';
            for(var i=0; i<messages.length; i++) {
            	if(messages[i].imgUrl){
            		html += '<img src='+messages[i].imgUrl+'>';
            	}
                html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
                html += messages[i].message + '<br />';
            }
            content.innerHTML = html;
        } else {
            console.log("There is a problem:", data);
        }
    });
 
    sendButton.onclick = function() {
        if(name.value == "") {
            alert("Please type your name!");
        } else {
            var text = field.value;
            var imgUrl = displayImg.src;
            var message={};
            if(imgUrl){
            	message={ message: text, username: name.value, imgUrl:imgUrl};
            }else{
            	message={ message: text, username: name.value};
            }
            socket.emit('send', message);
            
        }
    };
 
}