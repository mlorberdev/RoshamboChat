!(function () {
    $("#nav_close").click(closeNav());

    listenForChat = () => {

        $("#chatInput").change(() => {
            var chat = $("#chatInput").val();
            var user = $("#user").html();
            var today = new Date();
            var time = today.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
            var upload = user + " (" + time + "): " + chat + "|" + today.getMilliseconds();
            $("#chatInput").val("");
            firebase.database().ref("chat").set(upload);
        });
    }

    addToChat = () => {

        firebase.database().ref("chat").on("value", snapshot => {

            var chatPost = JSON.stringify(snapshot.val()).toString().split('"')[1].split("|")[0];
            $("#chatArea").append(`<p>${chatPost}</p>`);
        },
            (errorObject) => {
                console.log("The read failed: " + errorObject.code);
            });

        return false;
    }

    listenForPlay = () => {

        $("#rpsButtons").on("click", (button) => {

            var user = $("#user").html();
            var target = button.target.id;

            if (target === "rpsButtons") {
                return false;
            } else {
                var playArea = $("#play").html();
                var upload = user + "|" + target;
                if (playArea.toString().indexOf(user) >= 0) {
                    return false;
                } else {
                    firebase.database().ref("chat").set(user + " played");
                    firebase.database().ref("play").set(upload);
                }
            }
        })
    }

    function addToPlay() {
        firebase.database().ref("play").on("value", (snapshot) => {
            var playPost = JSON.stringify(snapshot.val()).toString().split('"')[1];
            if (playPost !== undefined && playPost !== "undefined") {
                $("#play").append(playPost + "|");
                if ($("#play").html().split("|").length === 5) {
                    calculateWin();
                }
            }
        });
    }

    calculateWin = () => {

        const split = $('#play').html().split("|");

        if (split.length < 4) {
            console.log("split not big enough");
        } else {

            p1 = split[0].toString(),
                m1 = split[1].toString(),
                p2 = split[2].toString(),
                m2 = split[3].toString(),
                winner = null;
            if (m1 === m2) {
                firebase.database().ref("chat").set('You tied!');
                $("#play").html("");
            } else {
                console.log("switching", m1 + m2);
                switch (m1 + m2) {
                    case "rockpaper":
                        winner = p2;
                        break;
                    case "paperrock":
                        winner = p1;
                        break;
                    case "scissorsrock":
                        winner = p2;
                        break;
                    case "rockscissors":
                        winner = p1;
                        break;
                    case "paperscissors":
                        winner = p2;
                        break;
                    case "scissorspaper":
                        winner = p1;
                        break;
                    default:
                        return false;
                }
                firebase.database().ref("chat").set(winner + " wins!");
                $("#play").html("");
            }
            firebase.database().ref("play").set(null);
        }
    }

    registerNewUser = (email, password) => {

        firebase.auth().createUserWithEmailAndPassword(email.value, password.value).catch((error) => {
            console.log("error:", error.code, error.message);
            openNav("newUserCreateErr", error.code, error.message);
            return;
        });
        $('#authWrapper').css("display", "block");
        $("#user").html(email.value);
    }

    bypassLogin = () => {
        $('#authWrapper').css("display", "block");
        const user = "user" + Math.floor(Math.random() * 10000);
        $("#user").html(user);
    }

    loginUser = (email, password) => {

        firebase.auth().signInWithEmailAndPassword(email.value, password.value).catch((error) => {

            alert("error:", error.code, error.message);
            openNav("whois", error.code, error.message);
            location.reload();
        });

        $('#authWrapper').css("display", "block");
        $("#user").html(email.value);
    }

    function signOut() {

        firebase.auth().signOut().then(() => {
            location.reload();
        }).catch((error) => {
            console.log(error);
        });
    }

    function reloadApp() {
        location.reload();
    }

    function closeNav() {
        $("#winLose").css("width", 0);
    }

    function showRegisterForm() {
        $("#authButton").removeClass("noDisplay");
        $('#formWrapper').css("display", "flex");
    }

    $(document).on("load", showLoginForm());

    function showLoginForm() {
        $("#lognButton").removeClass("noDisplay");
        $('#formWrapper').css("display", "flex");
    }

    function closeForm() {
        $('#formWrapper').css("display", "none");
    }


    initializeFirebaseApp = () => {

        const config = {
            apiKey: "AIzaSyBEayi0ObFoMW9T7XASS9LHB7b1QdW7T-s",
            authDomain: "bootcamp-unit-7-project.firebaseapp.com",
            databaseURL: "https://bootcamp-unit-7-project.firebaseio.com",
            projectId: "bootcamp-unit-7-project",
            storageBucket: "bootcamp-unit-7-project.appspot.com",
            messagingSenderId: "281356085329",
            appId: "1:281356085329:web:e9830df78961f52c8b7070",
            measurementId: "G-GK8YVX5QJ8"
        };

        firebase.initializeApp(config);
        firebase.database().ref("chat").set("");
        firebase.database().ref("play").set(null);
        listenForChat();
        addToChat();
        listenForPlay();
        addToPlay();

    }

    initializeFirebaseApp();

})();