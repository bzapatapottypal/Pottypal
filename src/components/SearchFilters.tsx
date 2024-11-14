import { Pressable, View, Text, StyleSheet } from "react-native"

const SearchFilters = ({handleFilter, searchADA, searchUnisex}) => {
  return(
    <View style={styles.toggleContainer}>
      <Pressable 
        style={[styles.button, { backgroundColor: searchADA ? 'gray' : 'transparent' }]}
        onPress={() =>{
          handleFilter('ADA', '')
        }}
      >
        <Text style={{padding: 5}}>ada toggle</Text>   
      </Pressable>
      <Pressable 
        style={[styles.button, { backgroundColor: searchUnisex ? 'gray' : 'transparent' }]}
        onPressOut={() => {
          handleFilter('unisex', '')
        }}
      >
        <Text style={{padding: 5}}>unisex toggle</Text>   
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#333',
  },
  toggleContainer: {
    flexDirection: 'row-reverse'
  },
});

export default SearchFilters;