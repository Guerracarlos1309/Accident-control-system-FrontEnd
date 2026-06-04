export const getNameByCode = (dataArray, codeToFind, currentPath = "") => {
  if (!codeToFind || !dataArray || !Array.isArray(dataArray)) return codeToFind;

  console.log("buscando ", codeToFind, "dentro de: ", dataArray);

  const cleanCodeToFind = codeToFind.toString().trim().toUpperCase();

  for (const item of dataArray) {
    if (item.code) {
      const cleanItemCode = item.code.toString().trim().toUpperCase();

      // Corregido: Ahora usa backticks (``) para que interprete las variables correctamente
      const newPath = currentPath ? `${currentPath} / ${item.name}` : item.name;

      if (cleanItemCode === cleanCodeToFind) {
        return newPath;
      }

      // Corregido: Este bloque ahora está DENTRO del bucle 'for' (antes de su llave de cierre)
      if (
        item.children &&
        Array.isArray(item.children) &&
        item.children.length > 0
      ) {
        const foundInChildren = getNameByCode(
          item.children,
          cleanCodeToFind,
          newPath,
        );

        if (foundInChildren !== cleanCodeToFind) {
          return foundInChildren;
        }
      }
    }
  } // <-- AQUÍ es donde realmente debe cerrarse el bucle 'for'

  return codeToFind;
};
