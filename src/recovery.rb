require 'rack'
require './src/functions'

# @param text    -> text to be parsed
# @return        -> undefined
# @postcondition -> session variables are set
def parse_sections(text)
  # parse the full post into individual sections
  text.scan(
    %r{\[\]\(/# MC // section (.*)\)\n((?:.*\n)*?)(?=\[\]\(/# MC // section .*\))}
  ).each do |name, content|
    break if name == 'END'
    # events get parsed later on
    session[name.downcase.to_sym] = content.strip unless content.strip == ''
  end

  parse_events session[:events] if session.key?(:events) \
                                && session[:events].length > 33
end

# @param events  -> raw text of events section
# @return        -> undefined
# @postcondition -> session[:events] is set properly
def parse_events(events)
  unposted, posted = events.split('# Timeline', 2)

  session[:events] = []

  # parse unposted events
  unposted.scan(%r{\[\]\(\/# MC // row (\d+) \| (.*) \| (.*) \|\)}) \
  do |row, time, message|
    session[:events][row.to_i] = [false, time.gsub('\)', ')'),
                                  message.gsub('\)', ')')]
  end

  # parse posted events
  posted.scan(%r{\| \[\]\(/# MC // row (\d+)\) (.*) \| (.*) \|}) \
  do |row, time, message|
    session[:events][row.to_i] = [true, time, message]
  end
end

# @param text    -> text to be parsed
# @return        -> undefined
# @postcondition -> session variables are set
def parse_vars(text)
  # parse the variables & set in session variables
  text.scan(%r{\[\]\(\/# MC // let (.*) = (.*)\)}) do |name, value|
    session[name.downcase.to_sym] = value == 'null' ? nil : value
  end
end

# @param url     -> valid URL to reddit post
# @return        -> 200 if success, 403 if not own post, 412 if not self post
# @postcondition -> session variables are set if recovery succeeded
def recover_post(url)
  id = %r{(?:www).reddit.com/r/(?:.*?)/comments/([0-9a-z]{6})}.match(url)
  post = (request.env['redd.session'].from_ids ["t3_#{id[1]}"].to_ary)[0]

  # require self post
  return 271 unless post.is_self

  # require OP to be current user
  return 270 unless request.env['redd.session'].me.name == post.author.name

  # set everything into session variables
  parse_vars post.selftext
  parse_sections post.selftext
  session[:post] = post.id

  200
end
