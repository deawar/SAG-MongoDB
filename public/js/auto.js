document.addEventListener('DOMContentLoaded', function(){
    let searchInput = document.getElementById('school-input');
    searchInput.addEventListener('input', getQuery);

    function getQuery(){
        let query = document.getElementById('school-input').value;
        console.log(query);

        if(query === ''){
            console.log('Search again');
        }else {
            let url = 'autocomplete' 
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = RecieveData.readyStateChange;
            xhr.open('GET',url,true);
            xhr.send();
        }
    }

    function RecieveData(){
        if(this.readyState == 4 && this.status == 200){
            console.log(this.responseText);
        }
    } 
});

$(function(){
    $('#school-input').autocomplete({
        source: function(req,res){
            $.ajax({
                url:"autocomplete/",
                dataType:"jsonp",
                type:"GET",
                data:req,
                success: function(data){
                    res(data)
                },
                error: function(err){
                    console.log(err.status);
                }
            });
        },
        minLength:1,
        select: function(event,ui) {
            if(ui.item){
                $('#school-input').val(ui.item.label);
            }
        }
    });
});