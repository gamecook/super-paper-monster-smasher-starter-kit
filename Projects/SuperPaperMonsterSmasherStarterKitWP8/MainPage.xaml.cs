using System;
using System.Diagnostics;
using System.Windows;
using Microsoft.Phone.Controls;

namespace SuperJetroidStarterKitWP8
{
    public partial class MainPage : PhoneApplicationPage
    {
        // Url of Home page
        private string MainUri = "/Html/index.html";

        // Constructor
        public MainPage()
        {
            InitializeComponent();
        }

        private void Browser_Loaded(object sender, RoutedEventArgs e)
        {
            Browser.IsScriptEnabled = true;
            // Add your URL here
            Browser.Navigate(new Uri(MainUri, UriKind.Relative));

            Browser.ScriptNotify += (s, arg) =>
            {
                Debug.WriteLine(arg.Value);
            };
        }

        // Handle navigation failures.
        private void Browser_NavigationFailed(object sender, System.Windows.Navigation.NavigationFailedEventArgs e)
        {
            MessageBox.Show("Navigation to this page failed, check your internet connection");
        }
    }
}