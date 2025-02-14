import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { GeoapifyGeocoderAutocomplete, GeoapifyContext } from '@geoapify/react-geocoder-autocomplete'
import BookDisplay from "../components/MattsBookDisplay/BookDisplay";
import Navbar from "../components/Navbar/Navbar";
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import ReactiveButton from 'reactive-button';
import Grid from '@mui/material/Grid';
import OpenIconSpeedDial from "../components/ActionButton/ActionButton";
import UserContext from '../hooks/Context'


interface Book {
  books: {
    id: string;
    title: string;
    author: string;
    image: string;
  }
  id: string;
  userId: string;
  wishlist: boolean;
  owned: boolean;
}

interface Props {
  radius: number;
  setRadius: (value: number) => void;
}



function Locations() {
  const userContext = useContext(UserContext);
  const user = userContext?.user;
  const id = user?.id;



  const [longitude, setLongitude] = useState(0);
  const [latitude, setLatitude] = useState(0);
  const [radius, setRadius] = useState(0);
  const [covertRadius, setConvertRadius] = useState(0);
  const [booksNearBy, setBooksNearBy] = useState<Book[]>([]);
  const [displayBooks, setDisplayBooks] = useState<any>([])
  const [buttonState, setButtonState] = useState('idle');
  const [locationState, setLocationState] = useState('idle');
  const [userLongitude, setUserLongitude] = useState(0);
  const [userLatitude, setUserLatitude] = useState(0);

  const saveLocation = async () => {
    setLocationState('loading');
    try {
      const res = await axios.put(`/location/${user.id}`, {
        longitude: userLongitude,
        latitude: userLatitude
      });
      //console.log(res)
      setTimeout(() => {
        setLocationState('success');
      }, 2000);
    } catch (err) {
      console.error(err);
    }

  }


  const getBooksNearMe = async () => {
    setButtonState('loading');
    try {
      const res = await axios.get('/location/locations', { params: { lon: longitude, lat: latitude, radius: covertRadius } });
      //console.log(res);
      setBooksNearBy(res.data.userBooks);
      setTimeout(() => {
        setButtonState('success');
      }, 2000);
    } catch (err) {
      //console.error(err);
    }

  }

  console.log(booksNearBy, 'booksNeaBy')

  useEffect(() => {
    const ownedBooks = booksNearBy.flat().filter(book => book.owned === true).map((book) => book.books);
    // console.log(ownedBooks, '69');
    setDisplayBooks(ownedBooks);
  }, [booksNearBy]);


  useEffect(() => {
    const convert = radius * 32;
    setConvertRadius(convert);
  }, [radius]);
  //console.log(displayBooks, 'displaybooks');


  const onPlaceSelect = (value: any) => {
    // console.log(value);
    setLatitude(value.properties.lat);
    setLongitude(value.properties.lon);
    setUserLatitude(value.properties.lat);
    setUserLongitude(value.properties.lon);
  }

  // console.log(longitude, '1');
  // console.log(latitude, '2');
  // console.log(radius, '3');


  const onSuggectionChange = (value: any) => {
    // console.log(value);
  }

  const handleRadiusChange = (e: any) => {
    const newRadius = e.target.value

    setRadius(newRadius);
  };









  return (
    <div>
      <Grid style={{ display: "flex", justifyContent: "center" }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid xs={3}>
          <h1>Enter Address</h1>
          <GeoapifyContext apiKey="6d182d93697140e88a9e75ab8d892bc5">
            <GeoapifyGeocoderAutocomplete
              placeholder="Enter address here"
              placeSelect={onPlaceSelect}
              suggestionsChange={onSuggectionChange}
            />
          </GeoapifyContext>
          <ReactiveButton
            rounded
            size="large"
            buttonState={locationState}
            idleText="Save Location"
            loadingText="Loading"
            successText="Done"
            //onClick={saveLocation}
            color="blue"
          />
        </Grid>
        <Grid xs={3}>
          <h1>Set Range in Miles</h1>
          <input
            type="number"
            value={radius}
            onChange={handleRadiusChange}
            placeholder="Set Range"
          />
          <Box width={175}>
            <Slider defaultValue={0} value={radius}
              onChange={handleRadiusChange} aria-label="Default" valueLabelDisplay="auto" />
          </Box>
          <ReactiveButton
            rounded
            size="large"
            buttonState={buttonState}
            idleText="Search For Books"
            loadingText="Loading"
            successText="Done"
            onClick={getBooksNearMe}
            color="blue"
          />
        </Grid>
      </Grid>
      {/* <button type="button" onClick={getBooksNearMe}>Search for Books</button> */}
      <BookDisplay books={displayBooks} id={id} />
    </div>
  )



}
export default Locations;