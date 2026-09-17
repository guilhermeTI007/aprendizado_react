import { useEffect, useState } from "react";
import { supabase } from "./supabase";

function App() {
  const[nome, alteraNome]= useState("")
  const[preco, alteraPreco]= useState("")
  const[descricao, alteraDescricao]= useState("")
  const[tamanho, alteraTamanho]= useState("")
  const [produtos, setProdutos] = useState([])

  async function inserir(){
    const obj ={
      nome:nome,
      preco:Number(preco),
      tamanho:Number(tamanho),
      descricao:descricao,
      relacion:""
    }

    const { data, error } = await supabase.from('produtos').insert(obj)

    console.log(data)
    console.log(error)

    buscaTodos()
  } 

  async function buscaTodos() {
    const { data, error } = await supabase.from('produtos').select()
    console.log(data)
    setProdutos(data)
  }

  useEffect(()=> {
    buscaTodos()
  }, [])

  return (
    <div>
      <h1>conexão com supabase</h1>

      <input onChange={e => alteraNome(e.target.value)} placeholder="digite o nome"></input>
      <br/>

      <input onChange={e => alteraPreco(e.target.value)} placeholder="digite o preço"></input>
      <br/>

      <input onChange={e => alteraDescricao(e.target.value)} placeholder="digite a descrição"></input>
      <br/>

      <input onChange={e => alteraTamanho(e.target.value)} placeholder="digite o tamanho"></input>
      <br/>

      <button onClick={inserir}>salvar</button>

      {produtos.map(i => <p key={i.id}>{i.nome} - R${i.preco} descrição: {i.descricao}</p>)}

    </div>
  );
}

export default App;