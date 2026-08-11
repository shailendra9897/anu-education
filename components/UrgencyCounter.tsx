"use client";

import { useEffect, useState } from "react";

export default function UrgencyCounter() {

const [studentsToday,setStudentsToday] = useState(0);
const [spotsLeft,setSpotsLeft] = useState(0);

useEffect(()=>{

const baseStudents = 14;
const randomAdd = Math.floor(Math.random()*6);

const baseSpots = 5;
const randomSpots = Math.floor(Math.random()*3);

setStudentsToday(baseStudents + randomAdd);
setSpotsLeft(baseSpots - randomSpots);

},[]);

return (

<div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6 text-center">

  <p className="text-sm font-medium text-gray-800">

    🔥 <span className="font-bold text-orange-600">{studentsToday}</span> students registered today

  </p>

  <p className="text-sm text-gray-700 mt-1">

    ⏳ Only <span className="font-bold text-red-600">{spotsLeft}</span> demo seats left

  </p>

</div>

);

}