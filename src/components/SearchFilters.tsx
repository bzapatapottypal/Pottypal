import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, View, Text, StyleSheet } from "react-native"

const SearchFilters = ({handleFilter, searchADA, searchUnisex}) => {
  return(
    <View style={styles.toggleContainer}>
      <MaterialCommunityIcons
        name="filter-variant" 
        size={31}
        iconStyle={{
          padding:0,
          margin:10
        }}
        style={{
        
        }}
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent:'flex-end',
          gap: 10
        }}
      >
        <Pressable
          style={[styles.button, { backgroundColor: searchADA ? 'lightgray' : 'transparent' }]}
          onPress={() =>{
            handleFilter('ADA', '');
          }}
        >
          <Text style={styles.filterText}>ADA</Text>   
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: searchUnisex ? 'lightgray' : 'transparent' }]}
          onPressOut={() => {
            handleFilter('unisex', '');
          }}
        >
          <Text style={styles.filterText}>Unisex</Text>   
        </Pressable>

        {/*PLACEHOLDER */}
        <Pressable
          style={[styles.button]}
          onPressOut={() => {
            handleFilter('unisex', '');
          }}
        >
          <Text style={styles.filterText}>Changing</Text>   
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 0,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#333',
    width: 80
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent:'space-between',
  },
  filterText: {
    padding: 5, 
    textAlign:'center'
  }
});

export default SearchFilters;