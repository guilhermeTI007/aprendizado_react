
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

function App() {
  const [produtos, setProdutos] = useState([])

  async function buscaTodos() {
    const { data, error } = await supabase.from('produtos').select()
    console.log(data)
    setProdutos(data)
  }

  useEffect(()=> (
    buscaTodos()
  ), [])
  return (
    <div>
      <h1>conexão com supabase</h1>

      {produtos.map(i => <p key={i.id}>{i.nome} - R${i.preco}</p>)}

    </div>
  );
}

export default App;
