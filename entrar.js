let login = document.getElementById("login");
let senha = document.getElementById("senha");
let entrar = document.getElementsByClassName("entrar")[0];

entrar.addEventListener("click", function(){
    if(login.value === "admin" && senha.value === "admin123"){
        alert("Login bem-sucedido!");
        window.location.href = "admin.html";
    }
    else{
        alert("Login ou senha incorretos. Tente novamente.");
    }
});