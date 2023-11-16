#!/bin/bash  
dataDir="./scpFiles"

for file in $(ls $dataDir); do
	if [[ -d  "$dataDir/$file" ]]; then
		continue
	fi

	# 把檔名中的太陽日抓出來 
	year=$(echo $(echo $file | cut -d'.' -f 1)| cut -d'_' -f 4)
	day=$(echo $file | cut -d'.' -f 3)
	# echo "$dataDir/$date"

	# 判斷沒有太陽日目錄就建立
	yearDir="$dataDir/$year"
	dayDir="$yearDir/$day"
	if [ ! -d $yearDir ]
	then  
	mkdir $yearDir
	fi
	if [ ! -d $dayDir ]
	then  
	mkdir $dayDir
	fi    

	# 把檔案移動到對應目錄下
	mv "$dataDir/$file" $dayDir
done

# 送上rfi
ssh_host="140.109.82.115"
ssh_user="dmc"
ssh_password="yxul45j/vup7005"
scp_dataDir="/data/dmc/Linode"
LinodeDir="$dataDir"

for yearDir in `ls $LinodeDir`
do
expect -c "
spawn rsync -avhr $LinodeDir/$yearDir $ssh_user@$ssh_host:$scp_dataDir
expect {
	\"*password*\" {
	set timeout 30
	send \"$ssh_password\r\"
	}
	\"*yes*\" {  
	set timeout 30  
	send \"yes\r\" 
	set timeout 30  
	expect \"*password*\" 
	set timeout 30  
	send \"$ssh_password\r\" 
	}  
	busy {send_user \"\n<error:busy>\";exit 1;}  
	failed {send_user \"\n<error:failed>\";exit 2;}  
	timeout {send_user \"\n<error:timeout>\";exit 3;}  
	}   
	expect {  
	\"*denied*\" {  
	send_user \"\n<error:Permission denied>\" 
	exit 4  
	}  
	\"*No such file*\" {  
	send_user \"\n<error:No such file>\" 
	exit 5  
	}  
	busy {send_user \"\n<error:busy>\";exit 6;}  
	failed {send_user \"\n<error:failed>\";exit 7;}  
	timeout {send_user \"\n<error:timeout>\";exit 8;}  
	}  
	exit 0 
}
expect eof"
done
# ————————————————
# 版权声明：本文为CSDN博主「itcast_xiaohuer」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
# 原文链接：https://blog.csdn.net/m0_38053092/article/details/105415863