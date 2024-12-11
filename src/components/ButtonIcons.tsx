import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons"

export const CloseButton = () => {
  return(
    <AntDesign name="close" color={'#000'} size={20} />
  )
}

export const DirectButton = ({name}) => {
  return(
    <MaterialCommunityIcons name={name} color={'#6485f8'} size={20} style={{marginRight:5}}/>
  )
}