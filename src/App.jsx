import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import TF from "./Pages/TuitionFinder";
import PDF_T from "./Pages/PersonalDetailsForm1_Teacher";
import Slots from "./Pages/Slots";
import PD from "./Pages/ProfileDashbooard";
import TeacherFinder from "./Pages/TeacherFinder";
import Role from "./Pages/Role";
import EDF_T from "./Pages/EducationalQualification_Teacher";
import Subject from './Pages/SubjectSelector';
import PDF_S from './Pages/PersonalDetails_Student';
import EDF_S from './Pages/EducationalQualification_Student';
import EDF_J from './Pages/EducationalQualification_Job';
import PDF_J from './Pages/PersonalDetails_Jobs';
import JobListing from "./Pages/JobListing";
import TeacherSubject from "./Pages/TeacherSubject";
import Dashboard from "./Pages/TutorDashboard"
import Admin from "./Pages/AdminDashboard";
import Admin_Teachers from "./Pages/AdminDashboard_Teachers";
import Adminsignin from "./Pages/AdminSignin";
const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<TF />} />
        <Route path='/details' element={<PDF_T />} />
        <Route path='/studentdetails1' element={<PDF_S />} />
        <Route path='/studentdetails2' element={<EDF_S />} />
        <Route path='/details2' element={<EDF_T />} />
        <Route path='/jobdetails1' element={<PDF_J />} />
        <Route path='/jobdetails2' element={<EDF_J />} />
        <Route path='/slots' element={<Slots />} />
        <Route path='/profile' element={<PD />} />
        <Route path='/tutor' element={<Dashboard/>} />
        <Route path='/teacherfinder' element={<TeacherFinder />} />
        <Route path='/role' element={<Role/>} />
        <Route path='/subject' element={<Subject/>} />
        <Route path='/joblist' element={<JobListing/>} />
        <Route path='/dashboard' element={<Dashboard/>} />
        <Route path='/Admin' element={<Admin/>} />
        <Route path='/Admin_Teacher' element={<Admin_Teachers/>}/>
        <Route path='/teacherSubject' element={<TeacherSubject/>} />
        <Route path='/adminsignin' element={<Adminsignin/>} />
        </Routes>
    </div>
  );
};

export default App;
