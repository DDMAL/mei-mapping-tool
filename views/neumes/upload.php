<?php
// Upload directory
$target_dir = "upload/";

$request = 1;
if(isset($_POST['request'])){
  $request = $_POST['request'];
}

// Upload file
if($request == 1){
  $target_file = $target_dir . basename($_FILES["file"]["name"]);

  $msg = "";
  if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_dir.$_FILES['file']['name'])) {
    $msg = "Successfully uploaded";
  }else{ 
    $msg = "Error while uploading";
  }
  echo $msg;
  exit;
}

// Read files from 
if($request == 2){
  $file_list = array();

  // Target directory
  $dir = $target_dir;
  if (is_dir($dir)){

    if ($dh = opendir($dir)){

      // Read files
      while (($file = readdir($dh)) !== false){

        if($file != '' && $file != '.' && $file != '..'){

          // File path
          $file_path = $target_dir.$file;

          // Check its not folder
          if(!is_dir($file_path)){

             $size = filesize($file_path);

             $file_list[] = array('name'=>$file,'size'=>$size,'path'=>$file_path);

          }
        }

      }
      closedir($dh);
    }
  }

  echo json_encode($file_list);
  exit;
}