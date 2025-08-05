export default (value : any) : boolean => {
  if(!!isNaN(parseInt(value))) return false
  const str = value.toString()
  if(str.includes("e") || str.includes("+") || str.includes("-")) return false
  return true
}