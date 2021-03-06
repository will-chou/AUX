const base_url = "http://passtheaux.party/"
const spotifybase = base_url + "spotify/";
const mongobase = base_url + "mongo/";
const loginbase = base_url + "login/";

var roomID = "";

async function searchSpotify(text){
	if (text == "") {
		alert("please enter a query");
		return []
	}
	const response = await fetch(spotifybase + 'search/' + text, {
		method: 'get',
		headers: {
			Accept: 'application/json',
		},
	})
	const json = await response.json()
	return json.array
}

function getClientCredentials(){
	fetch(spotifybase + 'auth',{
		method: 'post'
	}).then(function(response) {
		return;
	}).catch(function(err) {
		//alert("this shit could NOT get authenticated")
	})
}

function displayResults(array){
	var mountpoint = document.getElementById('song__mountpoint');
	mountpoint.innerHTML = "";
	mountpoint.className = mountpoint.className + " border";

	array.forEach((entry) => {
		displayName = entry.display;

		var songDiv = document.createElement('li');
		songDiv.className = "list-group-item";
		songDiv.setAttribute('data-id', entry.id);

		var songTitle = document.createElement('p');
		songTitle.innerHTML = displayName;

		songDiv.appendChild(songTitle);
		songDiv.addEventListener('click', function(){
			chooseSong(this);
		});
		mountpoint.appendChild(songDiv);
	})
}

async function chooseSong(song){
	songID = song.getAttribute('data-id');

	if (songID == "") {
		alert("error with choosing song");
		return;
	}
	if (roomID == "") {
		alert("no room code entered");
		return;
	}

	document.getElementById('song__search-input').innerHTML = song.childNodes[0].innerHTML;

	try {
      const response = await fetch(mongobase + "addSong", {
        method: 'POST',
        // credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        	roomID: roomID,
        	songID: songID,
        })
      });
      const status = response.status;
      const text = await response.text()
      if (status >= 200 && status < 300) {
      	var mountpoint = document.getElementById('song__mountpoint');
      	mountpoint.innerHTML = "";
      	return;
      }
    } catch(e) {
      return {
        err: e.message,
      };
    }
}

async function checkRoomExists(roomID) {
  var splashModal = document.getElementById('splashModal');

	try {
      const response = await fetch(mongobase + "checkRoomExists/" + roomID, {
        method: 'GET',
        headers: { "Content-Type": "application/json" },
      });
      const status = response.status;
      if (status >= 200 && status < 300) {
      	splashModal.style.display = 'none';
				document.getElementById('roomID-header').innerHTML = roomID;
        splashModal.className = "modal fade";
      }else{
				document.getElementById('roomID-header').innerHTML = "Could not find Room"
        splashModal.className += " in";
        setTimeout(function() {splashModal.style.display = 'block'}, 1000);
        document.getElementById('roomID-input').value = "";
        roomID = "";
      }
    } catch(e) {
      return {
        err: e.message,
      };
    }
}


window.onload =
function(){
  	getClientCredentials();

    document.getElementById('song__search-button').addEventListener('click',
      function(){
      	var text = document.getElementById('song__search-input').value;
        text = text.replace(/\s/g, '+')
        searchSpotify(text).then((result) => {
        	displayResults(result)
        })
     });

    document.getElementById('roomID-button').addEventListener('click',
    	function(){
    		var text = document.getElementById('roomID-input').value;
    		text = text.toLowerCase();
    		roomID = text;

        checkRoomExists(roomID);
    	})
}
