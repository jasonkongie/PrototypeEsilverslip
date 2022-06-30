const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
const studentsSheet = spreadsheet.getSheetByName('Students');
const requestsSheet = spreadsheet.getSheetByName('Requests'); //this needs to be linked as we will write to it later on
const teachersSheet = spreadsheet.getSheetByName('Teachers');


//get data from sheets
const studentsData = studentsSheet.getDataRange().getValues();
const requestsData = requestsSheet.getDataRange().getValues();
const teachersData = teachersSheet.getDataRange().getValues();

//Student Class
class Student
{
  constructor(name, homeroom, email)
  {
    this.name = name;
    this.homeroom = homeroom;
    this.email = email;
    this.currentRoom = undefined;
  }
}

//Teacher Class
class Teacher
{
  constructor(name, homeroom, email)
  {
    this.name = name;
    this.homeroom = homeroom;
    this.email = email;
  }
}

//Room Class
class Room
{
  constructor(teacher, roomName)
  {
    this.teacher = teacher;
    this.roomName = roomName;
    this.students = {};
    this.arrivalList = [];
    this.leavingList = [];

  }

  addToArrivalList(student) 
  {
    this.arrivalList.push(student.name)
  }

  addStudent(student)
  {
    Logger.log("Adding student " + student.name + " to room " + this.roomName);
    if (student.currentRoom != undefined)
    {
      throw new Error("Student is already in a room: remove the student using Room.removeStudent(student) first!");
    }  
    this.students[student.name] = student;
    student.currentRoom = this;
    Logger.log("Added successfully");
  }

  removeStudent(student)
  {
    Logger.log("Removing student " + student.name + " from room " + this.roomName)
    if (student.name in this.students)
    {
      this.leavingList.push(student);
      student.currentRoom = undefined;
      delete this.students[student.name]
      Logger.log("Removed successfully");
    }
    else
    {
      Logger.log("Student not found in room" + this.roomName);
    }
  }
}

class School
{

  constructor()
  {
    this.rooms = {}
    this.students = {}
  }


 setDefaultState()
{

    for (var i = 1; i < teachersData.length; i++) //we're starting at index 1 because index 0 is the first row (form questions and not responses)
    {
      //email addr, teacher name, class name, lcoation
      var teacher = new Teacher(teachersData[i][2], teachersData[i][3], teachersData[i][1])
      var room = new Room(teacher, teachersData[i][3]);
      Logger.log(room)
      if (room.roomName in this.rooms)
      {
        Logger.log(`Conflict detected: Same room names: ${room.roomName}`)
      }
      else
      {
        this.rooms[room.roomName] = room;
      }
    }

    for (var i = 1; i < studentsData.length; i++) //we're starting at index 1 because index 0 is the first row (form questions and not responses)
    {
      //email, name, dest, purpose, status
      //STUDENT(name, homeroom, email)
      const student = new Student(studentsData[i][2], studentsData[i][4], studentsData[i][1]);
      this.students[student.name] = student; //populate student dictionary
      const roomName = student.homeroom;
      if (roomName in this.rooms)
      {
        this.rooms[roomName].addStudent(student);
      }
      else
      {
        Logger.log("No room of name " + roomName + " for student " + student.name);
      }
    }
  }




  processRequests() 
{
  //move students to their destination rooms
  Logger.log("Processing Move Requests:");
  for (var i = 1; i < requestsData.length; i++)  //we're starting at index 1 because index 0 is the first row (form questions and not responses)
  {
    if (requestsData[i][1] == "") //skip empty row
    {
      continue;
    }
    var roomName = requestsData[i][3]
    if (!(roomName in this.rooms)) 
    {
      continue
    }
    var destRoom = this.rooms[roomName];    //index 3 (column D) holds their destination room name
    var studentName = requestsData[i][2];                 //index 2 (column C) holds the id of the student who requested the room change
    var status = requestsData[i][5]
    if (!(studentName in this.students)) //check if student is valid
    {
      studentsSheet.getRange(i, 6).setValue('Not In DataBase')
      Logger.log("Student with email " + studentName + " not found in database.")
      continue;
    }

    var student = this.students[studentName];

    if (destRoom.name == student.currentRoom.name)
    {
      studentsSheet.getRange(i, 6).setValue('Same as HomeRoom')
      Logger.log(`${studentName}'s Destination same as Home-Room.`)
      continue
    }

    if (status != 'Request')
    {
      Logger.log(`${studentName}'s Request Not Processed.`)
      continue
    }
    
    //moving student to their destination room
    Logger.log("Row: " + i + " - " + student.name + "?, " + student.name + " -> " + destRoom.roomName);
    student.currentRoom.removeStudent(student)
    destRoom.addStudent(student);
    destRoom.addToArrivalList(student);

    //emailing student
    var emailContent = `Hello ${student.name},\n\nPlease go to ${student.currentRoom.roomName} during Embedded-Time`
    GmailApp.sendEmail(student.email, 'e-silverslip request APPROVED', emailContent)

  }
}
  notifyTeachers()
  {
    for (var i=0; i<Object.keys(this.rooms).length; i++) 
    {
      var room = this.rooms[Object.keys(this.rooms)[i]] //get room 
      Logger.log(room.arrivalList)
      var arrivalText = emailText(room.arrivalList);
      var departingText = emailText(room.leavingList);
      Logger.log('Email Sent')
      GmailApp.sendEmail(room.teacher.email, 'e-silverslip attendance', `Hello ${room.teacher.name},\n\n Here are the students arriving:\n${arrivalText}\n\nHere are the students departing:\n${departingText}`)
    }
  }
}
