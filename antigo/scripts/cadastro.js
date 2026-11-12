function cadastro(event) {
    event.preventDefault();

    let nome= document.getElementById('inome')
    let gmail= document.getElementById('iemail')
    let senha = document.getElementById('isenha')

    let Nome = nome.value;
    let Email = gmail.value;
    let Senha = senha.value;

    // Vericiando se tem menor que 5 letras
        
        if (Email.length < 5 || Senha.length < 5 || Nome.length < 5) {
            window.alert('Cadastro errados!, tente novamente')
                return false;
        }
        /* verifica se o email tem mais de 50 caracteres*/
        else if(Email.length > 50) {
            window.alert('Seu email passou de 50 caracteres!')
                return false;
        } 
         /*verifica se o email tem @*/
        else if (!Email.includes('@')){
            window.alert('Acrescente @ no email!')
                return false;
        }
        /*Verifica a senha se esta correto conforme os caracteres */
        else if (!/[a-zA-Z]/.test(Senha) || !/[0-9]/.test(Senha)){
            window.alert(`A senha deve conter letras e números!`)
                return false;
        }

        /*Passou tudo, vai aparecer uma mensagem e vai jogar  o usuario para a o cadastro*/
        else{
            window.alert('Login feito com Sucesso!')

             window.location.assign("loja.html");
            
            
             fetch('https://commute-doormat-operator.ngrok-free.dev/dados',{
                method:'POST',
                headers: {
                    'content-Type':'application/json'
                },
                body:JSON.stringify({
                    'nome':Nome,
                    'email':Email,
                    'senha':Senha
                })
            })
            
            return false;
        }
} 
// Pegando resposta //
async function buscarDados() {
  try {
    // 1. Faz a requisição para a URL da API
    const response = await fetch('https://commute-doormat-operator.ngrok-free.dev/dados');
    
    // 2. Verifica se a resposta foi bem-sucedida (status 200-299)
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }
    
    // 3. Converte a resposta bruta em um objeto JSON do JavaScript
    const dados = await response.json();
    
    // 4. Utiliza os dados recebidos
    console.log(dados);
  } catch (error) {
    // Trata possíveis erros de rede ou de conversão
    console.error('Ocorreu um erro:', error);
  }
}

// Executa a função
buscarDados();

// Mudar tema 
const root = document.documentElement;
const btn = document.getElementById("ibtn");

btn.addEventListener("click", () => {
    const escuro = root.getAttribute("tema-data") === 'escuro'

    if (escuro) {
        root.removeAttribute("tema-data")
    } else {
        root.setAttribute("tema-data", "escuro")
    }
})