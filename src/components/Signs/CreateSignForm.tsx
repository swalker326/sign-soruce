import { api } from "~/utils/api";

export function CreateSignForm() {
  const mutation = api.sign.create.useMutation();

  return (
    <div>
      <input></input>
    </div>
  );
}
