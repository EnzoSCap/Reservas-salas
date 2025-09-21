# Sistema de Reservas de Salas — Protótipo (GitHub Pages)

**Disciplina:** Engenharia e Projeto de Software  
**Aluno:** Enzo Soares Capdeville (substitua se necessário)  
**Resumo:** Protótipo cliente-only (Single Page App) que permite cadastrar usuários, criar salas e reservar horários com verificação de conflitos. Dados persistem no `localStorage` do navegador. Ideal para entrega via GitHub Pages.

## Como executar
1. Acesse o GitHub Pages do repositório (ver instruções abaixo) ou simplesmente abra `index.html` localmente no navegador.
2. Registrar um usuário (ou usar credenciais: admin@local / admin).  
3. Como administrador (`tipo=admin`) você pode criar salas. Depois crie reservas.

## Publicação no GitHub Pages
- Vá em **Settings → Pages** e selecione **branch: main** e **root**. Salve.  
- Após alguns minutos, a página ficará disponível em: `https://<seu-usuario>.github.io/<seu-repo>/`

## Observações
- Protótipo 100% client-side para facilitar avaliação e publicação sem servidor.
- Export/Import de dados disponível para compartilhar estado entre avaliadores.

## Estrutura
- `index.html` — aplicação completa (HTML / CSS / JS)
