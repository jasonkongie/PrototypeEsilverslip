function emailText(arr)
  {
    var temp = []
    for (var i = 0; i < arr.length; i++)
    {
      var student = arr[i];
      temp.push(`${student.name}`)
    }
    return temp.join('\n');
  }


function main() 
{
  var gabrielino = new School()
  gabrielino.setDefaultState()
  gabrielino.processRequests()
  gabrielino.notifyTeachers()
}
