# PirpleAssignment2

#step 1
payload
{
  "firstName": "john",
  "lastName" : "doe",
  "email": "john@doe.com",
  "password": "test",
  "tosAgreement": true,
  "address": "1234 test blvd, test"
}
create user with emailid, password, firstname, lastname and address
result: 
{"firstName":"john","lastName":"doe","hashedPassword":"d656b8db3fa328ad2e349c2e6d16d36b4c1f2c0a77a61daeb57f1d094cc2b3c3","email":"john@doe.com","address":"1234 test blvd, test","tosAgreement":true}

#step 2
Create tokens
payload
{
  "email": "john@doe.com",
  "password": "test"
}
create token with id, expires at and user email; 
result
{"id":"f6cah93lrks9ndj643l5","userEmail":"john@doe.com","expiresAt":1534137208107}

#step3
Modify user Data <access control via token>

#step4
Modify token data <access control via token>

#step5
Get user Data <token and user email>
Result: 
{
userData: userData, 
menuItems: menuItems, 
orderHistory: userOrderHistory
}

Eg: 
{
    "userData": {
        "firstName": "john",
        "lastName": "doe",
        "email": "john@doe.com",
        "address": "1234 test blvd, test",
        "tosAgreement": true,
        "orders": [
            "3gclswmm6shk089fxd09",
            "rm7n60lt28p6lt469zre",
            "bp4g9y2szqs7vef1av94"
        ]
    },
    "menus": [
        {
            "id": 0,
            "productName": "Pepperoni Pizza",
            "productPrice": 2.99
        },
        {
            "id": 1,
            "productName": "Double Margarita",
            "productPrice": 1.99
        },
        {
            "id": 2,
            "productName": "Chicken Feast",
            "productPrice": 3.99
        }
    ],
    "orderHistory": [
        {
            "id": "3gclswmm6shk089fxd09",
            "items": [
                {
                    "id": 1,
                    "qty": 2
                },
                {
                    "id": 2,
                    "qty": 2
                }
            ],
            "amount": 11.96,
            "paymentId": "ch_1CyX5oFSfrG8mvvNwcbCBHhj",
            "paymentStatus": "succeeded",
            "orderDate": 1534132304000
        },
        {
            "id": "bp4g9y2szqs7vef1av94",
            "items": [
                {
                    "id": 2,
                    "qty": 2
                }
            ],
            "amount": 7.98,
            "paymentId": "ch_1CyXIAFSfrG8mvvN5c2zIMo3",
            "paymentStatus": "succeeded",
            "orderDate": 1534133070000
        },
        {
            "id": "rm7n60lt28p6lt469zre",
            "items": [
                {
                    "id": 1,
                    "qty": 2
                },
                {
                    "id": 2,
                    "qty": 2
                }
            ],
            "amount": 11.96,
            "paymentId": "ch_1CyXHPFSfrG8mvvNahnTFWVr",
            "paymentStatus": "succeeded",
            "orderDate": 1534133023000
        }
    ]
}

#step6 
delete user data <token>
deletes 
userdata from users, 
token from tokens, 
userOrderHistory from orders 

#step7
extend token <refresh token and extend it by 1hr>

#step8
delete token destroys the specified token

#step9
orders
request payload 
{
	"cartInfo": [{"itemId": 1, "itemQty": 2.3}, {"itemId": 2, "itemQty": 2}]
}
Upon placing the order, payment process will be initiated and the orders are stored in the user profile and payment data is dumped into payment logs with orderId as identifier and new 
entry in order table is created
Order table
{"id":"3gclswmm6shk089fxd09","userEmail":"john@doe.com","items":[{"id":1,"qty":2},{"id":2,"qty":2}],"amount":11.96,"paymentId":"ch_1CyX5oFSfrG8mvvNwcbCBHhj","paymentStatus":"succeeded","orderDate":1534132304000}

User table
{
	"firstName":"john","lastName":"doe","hashedPassword":"d656b8db3fa328ad2e349c2e6d16d36b4c1f2c0a77a61daeb57f1d094cc2b3c3","email":"john@doe.com","address":"1234 test blvd, test","tosAgreement":true,"orders":["3gclswmm6shk089fxd09","rm7n60lt28p6lt469zre","bp4g9y2szqs7vef1av94"]
}

payment log
{"orderId":"z97uwz1l1o9eo2w3fl02","paymentData":{"id":"ch_1CyWjcFSfrG8mvvNKHRdpwoo","object":"charge","amount":398,"amount_refunded":0,"application":null,"application_fee":null,"balance_transaction":"txn_1CyWjcFSfrG8mvvN8Abp4dQP","captured":true,"created":1534130928,"currency":"usd","customer":null,"description":"Payment for  seetharaghavan8@gmail.com","destination":null,"dispute":null,"failure_code":null,"failure_message":null,"fraud_details":{},"invoice":null,"livemode":false,"metadata":{},"on_behalf_of":null,"order":null,"outcome":{"network_status":"approved_by_network","reason":null,"risk_level":"normal","seller_message":"Payment complete.","type":"authorized"},"paid":true,"receipt_email":null,"receipt_number":null,"refunded":false,"refunds":{"object":"list","data":[],"has_more":false,"total_count":0,"url":"/v1/charges/ch_1CyWjcFSfrG8mvvNKHRdpwoo/refunds"},"review":null,"shipping":null,"source":{"id":"card_1CyWjcFSfrG8mvvNCdauCKR8","object":"card","address_city":null,"address_country":null,"address_line1":null,"address_line1_check":null,"address_line2":null,"address_state":null,"address_zip":null,"address_zip_check":null,"brand":"Visa","country":"US","customer":null,"cvc_check":null,"dynamic_last4":null,"exp_month":8,"exp_year":2019,"fingerprint":"et1ui7ZwoYshp58j","funding":"credit","last4":"4242","metadata":{},"name":null,"tokenization_method":null},"source_transfer":null,"statement_descriptor":null,"status":"succeeded","transfer_group":null}}

#step10
background workers
workers will compress the log file to gzip.b64 files in the interval configured in the config file
gz.b64 sample
H4sIAAAAAAAAA31UTU8bMRC991dEPiNCQtKEnCoVgXqpqFBBtKosx57Nmnjt7djesKD89453s7sKRD36zfd7M35jDhXgN8VW7PJ17re4/pzL541y1RS9mrMzVoq6ABuuRRBs9cZ0cpU5n3ytH+cPN/


