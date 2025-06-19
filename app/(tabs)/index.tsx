import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import axios from 'axios';
import { Card } from 'react-native-elements';

export default function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Placeholder URL; replace with backend URL later
    axios.get('https://marketplaceapp-e7zd.onrender.com/products')
      .then(response => setProducts(response.data))
      .catch(error => console.log('Error:', error));
  }, []);

  return (
    <View>
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <Card>
            <Text>{item.name}</Text>
            <Text>{item.price}</Text>
          </Card>
        )}
        keyExtractor={item => item.url || item.name}
      />
    </View>
  );
}