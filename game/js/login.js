function fun() {
            var loginForm = document.getElementById("login");
            var registerForm = document.getElementById("register");
            
            if (loginForm.style.display === "none") {
                loginForm.style.display = "block";
                registerForm.style.display = "none";
            } else {
                loginForm.style.display = "none";
                registerForm.style.display = "block";
            }
        }
var users=null;
var password1=null;
var confirmPassword=null;
var username=0;
var password=null;

function register(){
	users = document.getElementById('login-username0').value;
    password1 = document.getElementById('login-password-0').value;
    confirmPassword = document.getElementById('login-password-1').value;
    if (password1.length < 6) {
        alert('密码长度不能少于6位');
        return;
    }
    else{
		if (password1 == confirmPassword) {
			alert('注册成功！');
			localStorage.setItem('localuser',users);
			localStorage.setItem('localpass',password1);
			location.href="index.html";
			return;
		}
		else{
			alert("两次输入的密码不一致");
			return;
		}
	}
}

function login(){
	username = document.getElementById('login-username').value;
	password = document.getElementById('login-password').value;
	if (!username||!password) {
		alert('请输入用户名及密码');
		return;
	}
	if (username!=localStorage.getItem('localuser')) {
		alert('该账号未注册，请先注册');
		return;
	}
	else {
		if ( password==localStorage.getItem('localpass')) {
			alert('登录成功！');
			location.href="index.html";
			return;
		}
		else{
			alert('密码错误，请重新输入');
			return;
		}
	}
}