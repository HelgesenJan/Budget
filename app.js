
// Budsjett kontrollør
var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    // Prosentregning
    Expense.prototype.calcPercentage = function (totalIncome) {
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    };

    // Henter prosenter
    Expense.prototype.getPercentage = function () {
      return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) { // Kan bruke vanlig for loop her også
            sum = sum + current.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            expense: [],
            income: []
        },

        totals: {
            expense: 0,
            income: 0
        },

        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, description, value) {
            var newItem, ID;

            // Finner siste ID i arrayet. Bruker -1 fordi array starter på 0. Ny id blir id + 1.
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }

            // Lager ny item
            if(type === "expense"){
                newItem = new Expense(ID, description, value);
            }else if(type === "income"){
                newItem = new Income(ID, description, value);
            }

            // Pusher til datastrukturen
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function(type, id){
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            // Bruker splice() for å fjerne itemet fra arrayet
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            // Kalkulere total inntekt og kostnader
            calculateTotal("expense");
            calculateTotal("income");

            // Kalkulere budsjettet: inntekt - kostnader
            data.budget = data.totals.income - data.totals.expense;

            // Kalkulere prosenten av budsjettet
            if(data.totals.income > 0){ 
                data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
            }else{
                data.percentage = -1;
            }
        },

        calculatePercentages: function(){
            // Går gjennom utgifter
            data.allItems.expense.forEach(function (current) {
                current.calcPercentage(data.totals.income);
            });
        },

        getPercentages: function(){
          var allPerc = data.allItems.expense.map(function (current) {
              return current.getPercentage();
          });
          return allPerc;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalIncome: data.totals.income,
                totalExpenses: data.totals.expense,
                percentage: data.percentage
            };
        },

        testing: function () {
            console.log(data);
        }
    }


})();

// UI kontrollør
var UIController = (function () {

    var DOMstrings = {
        inputType: ".addType",
        inputDesc: ".addDescription",
        inputValue: ".addValue",
        inputBtn: ".addBtn",
        incomeContainer: ".incomeList",
        expensesContainer: ".expensesList",
        budgetLabel: ".budgetValue",
        incomeLabel: ".budgetIncomeValue",
        expensesLabel: ".budgetExpensesValue",
        percentageLabel: ".budgetExpensesPercentage",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budgetTitleMonth"
    };

    var formatNumber = function(num, type){
        var numSplit, int, dec;
   
       
        num = Math.abs(num);  // abs står for absolute og overrider num
        num = num.toFixed(2); // 2 desimaler
        numSplit = num.split(".");

        int = numSplit[0];

        if(int.length > 3){
            int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === "expense" ? "-" : "+") + " " + int + "." + dec;
    };

    // Looper gjennom alle elementene i nodelisten og bytte innholdet.
    var nodeListForEach = function(list, callback){
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getinput: function () {
            return {
                type : document.querySelector(DOMstrings.inputType).value, 
                description : document.querySelector(DOMstrings.inputDesc).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem: function(obj, type){
            var html, newHtml, element;

            // Lager HTML string med placeholder tekst
            if(type === "income"){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div> <div ' +
                    'class="right clearfix"> <div class="item__value">%value%kr</div> <div class="item__delete"> <button ' +
                    'class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }else if(type === "expense"){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"> <div class="item__description">%description%</div> <div ' +
                'class="right clearfix"> <div class="item__value">%value%kr</div> <div class="item__percentage">21%</div> <div ' +
                'class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
            }

            // Erstatter placeholderen med data
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

            // Legger til HTML'en i DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
        },

        deleteListItem: function(selectorID){
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearFields: function(){
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDesc + ", " +  DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
         
            fieldsArr[0].focus();
        },

        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = "income" : type = "expense";

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type) + "kr";
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, "income") + "kr";
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, "expense") + "kr";

            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";
            }
        },

        displayPercentages: function(percentages){

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function (current, index) { 
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + "%";
                }else{
                    current.textContent = "---";
                }
            });
        },

        displayMonth: function(){
            var now, months, month, year;
            now = new Date();

            months = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;

        },

        changedType: function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType + "," + DOMstrings.inputDesc + "," + DOMstrings.inputValue
            );

            nodeListForEach(fields, function (current) {
               current.classList.toggle("red-focus");
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    }
})();


var controller = (function (budgetCtrl, UICtrl) {


    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener("click", controlAddItem); // trenger ikke call event her

        document.addEventListener("keypress", function (evt) {
            if(evt.key === "Enter"){
                controlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener("click", controlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
    };

    var updatePercentages = function(){

        // 1. Kalkuler prosenter
            budgetCtrl.calculatePercentages();

        // 2. Lese prosenter fra budsjettkontrolløren
            var percentages = budgetCtrl.getPercentages();

        // 3. Oppdatere UI med nye prosenter
            UICtrl.displayPercentages(percentages);
    };

    var controlAddItem = function(){
        var input, newItem;
        // 1. Hent input data
        input = UIController.getinput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){ 

            // 2. Legg til itemet i budsjettkontrolløren
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Legg til itemet i UI'et
            UICtrl.addListItem(newItem, input.type);

            // 4. Tøm feltene
            UICtrl.clearFields();

            // 5. updateBudget - kalkulerer og oppdaterer budsjettet
            updateBudget();

            // 6. updatePefcentages - kalkulerer og oppdaterer prosentene
            updatePercentages();
        }
    };

    var controlDeleteItem = function (evt) {
        var itemID, splitID, type, ID;
   
        itemID = evt.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]); 

            // 1. Slette itemet fra datastrukturen
            budgetCtrl.deleteItem(type, ID);

            // 2. Slette itemet fra UI
            UICtrl.deleteListItem(itemID);

            // 3. Oppdatere budsjettet
            updateBudget();

            // 4. updatePefcentages - kalkulerer og oppdaterer prosentene
            updatePercentages();
        }
    };

    var updateBudget = function () {
        // 1. Kalkuler budsjettet
        budgetCtrl.calculateBudget();

        // 2. Returnerer budsjettet
        var budget = budgetCtrl.getBudget();

        // 3. Vis budsjettet i UI'et
        UICtrl.displayBudget(budget);
    };

    // INIT
    return {
        init: function () {
            console.log("Application has started.");
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }
})(budgetController, UIController);

controller.init();