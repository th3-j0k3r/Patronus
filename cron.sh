#!/bin/bash
echo -e '#!/bin/bash\ncd /root;python3 main.py >> /tmp/patronus.log 2>&1' >> run.sh;
touch logs.txt
touch /root/logs.txt
chmod +x run.sh;
env >> patronus.env;
crontab -l 2>/dev/null;
echo -e 'SHELL=/bin/bash\n45 04 * * * env - `cat /root/Patronus/patronus.env` /root/Patronus/run.sh' | crontab - ;
crond && tail -f /dev/null
python3 /root/initialize.py