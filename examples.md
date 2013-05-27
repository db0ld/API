Queries examples
================

Creating an user
----------------

**POST /api/v1/users**

{
    "login": "tuxkowo",
    "firstname": "Guillaume",
    "gender": "male",
    "password": "kikoolol",
    "birthdate": "Sun Oct 20 1991 02:00:00 GMT+0200 (Romance Daylight Time)",
    "lang": "fr-FR"
}

Getting a token
---------------

**POST /api/v1/tokens**

{
    "login": "tuxkowo",
    "password": "kikoolol"
}