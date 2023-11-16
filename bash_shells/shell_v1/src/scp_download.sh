#!/usr/bin/expect  
#author: yifangyou  
#create time:2011-05-17  
#host  
set scphost "[lindex $argv 0]" 
#ssh端口  
set port "[lindex $argv 1]" 
#ssh用户名  
set scpuser "[lindex $argv 2]" 
#ssh密码  
set scppw "[lindex $argv 3]" 
#要在远程机器上的要下载到本地的文件名或者目录  
set target "[lindex $argv 4]" 
#要下载的文件名或者目录  
set file "[lindex $argv 5]" 
spawn scp -r -P $port $scpuser@$scphost:$target $file  
#设置超时时间，防止远程机器防火墙没有开，而挂起  
set timeout 2
expect {  
#respose: "root@1.2.3.4's password:",自动输入密码  
"*password*" {  
set timeout 30  
send "$scppw\r" 
}  
#the first connect will respose "Are you sure you want to continue connecting (yes/no)? yes" 
"*yes*" {  
set timeout 30  
send "yes\r" 
set timeout 30  
expect "*password*" 
set timeout 30  
send "$scppw\r" 
}  
busy {send_user "\n<error:busy>";exit 1;}  
failed {send_user "\n<error:failed>";exit 2;}  
timeout {send_user "\n<error:timeout>";exit 3;}  
}  
#Permission denied not try again,回报出错信息  
expect {  
"*denied*" {  
send_user "\n<error:Permission denied>" 
exit 4  
}  
"*No such file*" {  
send_user "\n<error:No such file>" 
exit 5  
}  
busy {send_user "\n<error:busy>";exit 6;}  
failed {send_user "\n<error:failed>";exit 7;}  
timeout {send_user "\n<error:timeout>";exit 8;}  
}  
exit 0 
