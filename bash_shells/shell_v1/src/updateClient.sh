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
#gitdir
set gitdir "[lindex $argv 4]" 
# spawn scp -r -P $port $scpuser@$scphost:$gitdir $file  
spawn ssh -X $scpuser@$scphost
send ls 
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

expect  "$*" { 
    # send "cd $gitdir;git reset --hard HEAD;git pull;sudo reboot\r"
    # send "sudo scp andy@140.109.80.93:~/QSIS/crontab/* /var/spool/cron/crontabs/\r"
    # send "echo 'https://earthinversion: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@github.com' > ~/.git-credentials;sudo reboot\r"
    send "cd ~/Desktop/QSIS-Data-Acquisition-System;git checkout qsis-client-dev;git pull;sudo reboot\r"
}

set timeout 5
expect {  
#respose: "root@1.2.3.4's password:",自动输入密码
"*password*" {  
set timeout 30  
send "ji3948vu84\r" 
}  
#the first connect will respose "Are you sure you want to continue connecting (yes/no)? yes" 
"*yes*" {  
set timeout 30  
send "yes\r" 
set timeout 30  
expect "*password*" 
set timeout 30  
send "ji3948vu84\r" 
}
busy {send_user "\n<error:busy>";exit 1;}  
failed {send_user "\n<error:failed>";exit 2;}  
timeout {send_user "\n<error:timeout>";exit 3;}    
} 
expect  "$*" { 
	exit 0
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

