<?php
        include('legacy_vars.php');
        //phpinfo();
        error_reporting(E_ALL);
        ini_set("display_errors", 0);

        header('Access-Control-Allow-Origin: *');
        //header('Content-Type: application/json; charset=utf-8');

        $conn = new mysqli("$host","$username","$my_pass","$db", "$port");
        $method = $_SERVER['REQUEST_METHOD'];

        if(mysqli_connect_error()){
                echo mysqli_connect_error();
                exit();
        }
        else{

                $sql = "SELECT * FROM customers;";
                $res = mysqli_query($conn, $sql);

                if($res){
                        if ($method == 'GET') {
                                $rows = mysqli_fetch_all($res, MYSQLI_ASSOC);
                                echo json_encode($rows);
                                /*foreach ($rows as $row) {
                                        echo json_encode($row);
                                }*/
                        }
                        $conn->close();
                }
                else {
                        echo "data error\n";
                        $conn->close();
                }
        }
                /*if (!$_GET) {
                        echo "get empty\n";
                        echo json_last_error_msg();
                        echo "\n";
                        echo print_r($_GET, true);
                        $conn->close();
                }*/
?>
