// import React, { useEffect } from 'react';
// import axios from 'axios';
// import { Routes, Route } from 'react-router-dom';

// import Home from './pages/Home';
// import Auth from './pages/Auth';

// import { useDispatch } from 'react-redux';
// import { setUserData } from './redux/userSlice';
// import InterviewPage from './pages/IntervierPage';


// export const ServerUrl = "http://localhost:8000";


// function App() {

//     const dispatch = useDispatch();


//     useEffect(() => {

//         const getUser = async () => {

//             try {

//                 const result = await axios.get(
//                     ServerUrl + "/api/user/current-user",
//                     {
//                         withCredentials: true
//                     }
//                 );

//                 dispatch(setUserData(result.data));

//             } catch (error) {

//                 console.log(error);

//                 dispatch(setUserData(null));

//             }

//         };


//         getUser();

//     }, [dispatch]);


//     return (

//         <Routes>

//             <Route
//                 path="/"
//                 element={<Home />}
//             />

//             <Route
//                 path="/auth"
//                 element={<Auth />}
//             />


//             <Route
//                 path="/interview"
//                 element={<InterviewPage/>}
//             />
//             <Route path='/history' element={<InterviewHistory/>}
//         />

//   <Route path='/pricing' element={<Pricing/>}/>


//         <Route path='/report/:id' element={<InterviewReport/>}/>

//         </Routes>
        

//     );
// }



// export default App;

import React, { useEffect } from "react";
import axios from "axios";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import InterviewPage from "./pages/IntervierPage";
import InterviewHistory from "./pages/interview.history";
import InterviewReport from "./pages/InterviewReport";
import Pricing from "./components/pricing";

import { useDispatch } from "react-redux";
import { setUserData } from "./redux/userSlice";

export const ServerUrl = "http://localhost:8000";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await axios.get(
          ServerUrl + "/api/user/current-user",
          {
            withCredentials: true,
          }
        );

        dispatch(setUserData(result.data));
      } catch (error) {
        console.log(error);
        dispatch(setUserData(null));
      }
    };

    getUser();
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/auth" element={<Auth />} />

      <Route
        path="/interview"
        element={<InterviewPage />}
      />

      <Route
        path="/history"
        element={<InterviewHistory />}
      />

      <Route
        path="/pricing"
        element={<Pricing />}
      />

      <Route
        path="/report/:id"
        element={<InterviewReport />}
      />
    </Routes>
  );
}

export default App;