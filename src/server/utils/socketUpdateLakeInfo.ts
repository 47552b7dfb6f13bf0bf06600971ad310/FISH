
export default async () => {
  if(!IO) return
  const lake = await getLakeInfo()
  IO.emit('update-lake-info', lake)
}