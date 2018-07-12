# Create SSL Certificate in IE 11
After executing `npm start`, open the IE 11 browser to the defined URL direction (e.g. `https://localhost:8080`). You will see that the browser will block the current page for security reasons, because no SSL certificate is defined for this URL.

![](img/ie-step1.png)

We will have to click in to the **More information** button, and allow to load the page by clicking **Go on to the webpage (not recommended)**.

You will see that the direction box is painted red, showing that the current page is not secure. You will have to create your own SSL certificate. To do so, click on the red shield icon and click **View certificates**.

![](img/ie-step2.png)

A dialog will be displayed. We will click the button **Install certificate**, which opens a new dialog. To create an SSL certificate for the current user, we will select **Current user** as place to save the certificate and we will click **Next**.

![](img/ie-step3.png)

Browse in **Place all certificates in the following store** and select the type of certificate **Trusted Root Certificate Authorities**. At the end, confirm and allow the installation of the certificate.

![](img/ie-step4.png)

To make the red warning disappear, we have to open a new tab.
