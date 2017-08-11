export function getTime(date, time){
    date = new Date(date);

    var theyear = date.getFullYear();
    var themonth = date.getMonth();
    var thetoday = date.getDate();
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    

    if(time !== true){
        return (thetoday + "/" + months[themonth] + "/" + theyear );
    }else{
        return (date.toLocaleString());
    }
    
}