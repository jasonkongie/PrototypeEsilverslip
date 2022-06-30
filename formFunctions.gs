//var form = FormApp.openById('1234567890abcdefghijklmnopqrstuvwxyz'); //enter the form id


function turnOffAcceptResponses()
{
  if (form.isAcceptingResponses() == true)
  {
    form.setAcceptingResponses(false)
    .setCustomClosedFormMessage('e-silverslips only accepts responses from x-y am')
  }
}

function turnOnAcceptResponses()
{
  if (form.isAcceptingResponses() == false) {
    form.setAcceptingResponses(true)
  }
}
