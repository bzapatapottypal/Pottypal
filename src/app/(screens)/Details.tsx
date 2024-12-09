import { genReview } from "@/src/components/GenData";
import { useCallback, useEffect, useRef, useState } from "react";
import { TextInput, Text, FlatList, View, Image } from "react-native";

import { Rating } from '@kolking/react-native-rating';
import { Light } from "@rnmapbox/maps";


const WriteReview = (item) => {
  const [rating, setRating] = useState(0);
  const [revInput, setRevInput] = useState('');
  
  const handleChange = useCallback(
    (value: number) => setRating(value), [rating],
  );

  return(
    /*TODO: add flag for repeat submissions, one per user id */
    <View
      style={{
        flex: 1
      }}
    >
      
      <TextInput 
        style={{ padding: 10, margin: 10 }}
        placeholder='Write a review'
        value={revInput}
        onChangeText={(text) => {
          setRevInput(text)
        }}
        onSubmitEditing={(text) => {
          //console.log(auth().currentUser?.providerData)
          genReview(text.nativeEvent.text, 68812, rating)
        }}  
      />
      <Rating
        size={40} 
        rating={rating} 
        onChange={handleChange}
        scale={1.1}
        style={{
        }}
      />
      <Image 
        source={{uri: 'https://lh3.googleusercontent.com/a/ACg8ocIiyrPuIRt0C8xJ7XTnne6X3qzm9ZprmFUrzHtUpT5UpDzWcA=s96-c'}}
        style={{width: 400, height: 400}}
      />
    </View>
  )

}

export const RenderReview = ({ item, destID, users }) => {
  
  if(item.locationID == destID){
    return(
      <View
        style={{
          padding: 10,

        }}
      >
        <View
          
        >
          <Text style={{fontSize:18}}>{item.user}</Text>
        </View>
        <Rating
          disabled={true}
          size={10} 
          rating={item.score}
          scale={1.1}
          style={{
            paddingBottom: 5
          }}
        />
        <Text style={{fontSize:16, fontWeight:400}}>{item.content}</Text>
        <Text style={{fontSize:14, fontWeight:300}}>
          Created at: 
          {item.createdAt.toDate()
            .toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          }
        </Text>
      </View>
    )
  }
  return
} 
export default WriteReview