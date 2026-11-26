import { useState, type JSX } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { CampoDeFormulario, type PropriedadesDoCampo } from "./CampoDeFormulario";

export function CampoDeSenha(propriedades: PropriedadesDoCampo): JSX.Element {
  const [isSenhaVisivel, setIsSenhaVisivel] = useState<boolean>(false);
  const rotuloDoBotao: string = `${isSenhaVisivel ? "Ocultar" : "Mostrar"} ${propriedades.rotulo.toLowerCase()}`;

  return (
    <CampoDeFormulario
      {...propriedades}
      Icone={LockKeyhole}
      type={isSenhaVisivel ? "text" : "password"}
      acao={
        <button
          type="button"
          className="password-toggle"
          aria-label={rotuloDoBotao}
          onClick={() => setIsSenhaVisivel(!isSenhaVisivel)}
        >
          {isSenhaVisivel ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      }
    />
  );
}
